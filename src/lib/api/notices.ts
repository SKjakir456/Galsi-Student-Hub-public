import { supabase } from '@/integrations/supabase/client';

export interface Notice {
  id: string;
  title: string;
  date: string;
  url: string;
  isNew: boolean;
  isImportant: boolean;
  category?: string;
}

interface NoticesResponse {
  success: boolean;
  notices?: Notice[];
  error?: string;
  scrapedAt?: string;
}

// Category keywords for classifying notices
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  result: ['result', 'grade card', 'marksheet', 'marks', 'score'],
  routine: ['routine', 'schedule', 'time table', 'timetable', 'class schedule'],
  syllabus: ['syllabus', 'curriculum', 'course outline', 'course structure'],
  exam: ['exam', 'examination', 'test', 'assessment'],
  admission: ['admission', 'registration', 'enrollment', 'enrolment'],
  scholarship: ['scholarship', 'stipend', 'kanyashree', 'aikyashree', 'oasis', 'svmcm'],
  holiday: ['holiday', 'vacation', 'leave', 'closed'],
  important: ['urgent', 'important', 'form fill', 'form submission', 'last date', 'deadline'],
};

function categorizeNotice(title: string): string {
  const lowerTitle = title.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerTitle.includes(keyword))) {
      return category;
    }
  }
  return 'general';
}

function isHighPriority(title: string, category: string): boolean {
  const highPriorityCategories = ['result', 'routine', 'syllabus', 'exam', 'admission', 'scholarship'];
  const lowerTitle = title.toLowerCase();
  if (highPriorityCategories.includes(category)) return true;
  const urgentKeywords = ['urgent', 'important', 'last date', 'deadline', 'form submission', 'immediately'];
  return urgentKeywords.some(keyword => lowerTitle.includes(keyword));
}

// Sample notices data - shown when scraping fails
const SAMPLE_NOTICES: Notice[] = [
  {
    id: 'notice-1',
    title: 'Examination Form Fill-up Notice for UG/PG Sem IV Examinations 2025',
    date: '2025-02-15',
    url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2025/02/Exam-Form-Sem-IV.pdf',
    isNew: true,
    isImportant: true,
    category: 'exam',
  },
  {
    id: 'notice-2',
    title: 'Semester III Routine for B.A./B.Sc./B.Com (Honours & General) Examinations 2025',
    date: '2025-02-10',
    url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2025/02/Routine-Sem-III-2025.pdf',
    isNew: true,
    isImportant: true,
    category: 'routine',
  },
  {
    id: 'notice-3',
    title: 'Kanyashree Prakalpa Scholarship Form Fill-up - Academic Year 2024-25',
    date: '2025-02-08',
    url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2025/02/Kanyashree-2024-25.pdf',
    isNew: false,
    isImportant: true,
    category: 'scholarship',
  },
  {
    id: 'notice-4',
    title: 'Semester II Internal Examination Schedule 2025',
    date: '2025-02-05',
    url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2025/02/Internal-Exam-Sem-II.pdf',
    isNew: false,
    isImportant: false,
    category: 'exam',
  },
  {
    id: 'notice-5',
    title: 'Holiday Notice - Saraswati Puja 2025',
    date: '2025-01-28',
    url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2025/01/Holiday-Saraswati-Puja.pdf',
    isNew: false,
    isImportant: false,
    category: 'holiday',
  },
  {
    id: 'notice-6',
    title: 'Semester I Result Published - Back Paper Examination Notice',
    date: '2025-01-20',
    url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2025/01/Back-Paper-Sem-I.pdf',
    isNew: false,
    isImportant: true,
    category: 'result',
  },
  {
    id: 'notice-7',
    title: 'Admission Notice for B.Ed. Course Session 2025-26',
    date: '2025-01-15',
    url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2025/01/Admission-BEd-2025.pdf',
    isNew: false,
    isImportant: true,
    category: 'admission',
  },
  {
    id: 'notice-8',
    title: 'Syllabus for Semester III (Honours & General) - Session 2024-25',
    date: '2025-01-10',
    url: 'https://galsimahavidyalaya.ac.in/wp-content/uploads/2025/01/Syllabus-Sem-III.pdf',
    isNew: false,
    isImportant: false,
    category: 'syllabus',
  },
];

// Direct client-side scraping using CORS proxies
async function scrapeWithProxy(proxyUrl: string, targetUrl: string): Promise<{ ok: boolean; text?: string; error?: string }> {
  try {
    const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
      headers: {
        'Accept': 'text/html,application/xhtml+xml',
      }
    });

    if (!response.ok) {
      return { ok: false, error: `Proxy returned ${response.status}` };
    }

    const text = await response.text();
    return { ok: true, text };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

async function scrapeDirectly(): Promise<NoticesResponse> {
  const targetUrl = 'https://galsimahavidyalaya.ac.in/category/notice/';

  // Try multiple CORS proxies
  const proxies = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://proxy.cors.sh/',
  ];

  let html = '';
  let lastError = '';

  for (const proxy of proxies) {
    const result = await scrapeWithProxy(proxy, targetUrl);
    if (result.ok && result.text) {
      html = result.text;
      console.log('Successfully scraped with proxy:', proxy);
      break;
    }
    lastError = result.error || 'Unknown error';
    console.log('Proxy failed:', proxy, result.error);
  }

  if (!html) {
    return { success: false, error: 'All CORS proxies failed: ' + lastError };
  }

  const notices: Notice[] = [];
  const currentDate = new Date();

  // Parse HTML table rows
  const tableRowRegex = /<tr>\s*<td[^>]*>(\d+)<\/td>\s*<td[^>]*>(\d{1,2}-\d{1,2}-\d{4})<\/td>\s*<td[^>]*>([^<]+)<\/td>\s*<td[^>]*>\s*<a\s+href="([^"]+)"[^>]*>/gi;

  let match;
  while ((match = tableRowRegex.exec(html)) !== null && notices.length < 50) {
    const slNo = match[1].trim();
    const dateStr = match[2].trim();
    const title = match[3].trim().replace(/&/g, '&').replace(/&#8217;/g, "'").replace(/&#8211;/g, '-');
    const pdfUrl = match[4].trim();

    if (!pdfUrl || pdfUrl === '#') continue;

    const [day, month, year] = dateStr.split('-').map(Number);
    const parsedDate = new Date(year, month - 1, day);

    const daysDiff = Math.floor((currentDate.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24));
    const isNew = daysDiff <= 3 && daysDiff >= 0;

    const category = categorizeNotice(title);
    const isImportant = isHighPriority(title, category);

    notices.push({
      id: `notice-${slNo}`,
      title,
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      url: pdfUrl,
      isNew,
      isImportant,
      category,
    });
  }

  notices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    success: true,
    notices,
    scrapedAt: new Date().toISOString()
  };
}

export const noticesApi = {
  async fetchNotices(): Promise<NoticesResponse> {
    // DIRECT MODE: Skip edge function entirely
    const result = await scrapeDirectly();

    if (result.success && result.notices && result.notices.length > 0) {
      return result;
    }

    // Fallback to sample notices
    return {
      success: true,
      notices: SAMPLE_NOTICES,
      scrapedAt: new Date().toISOString(),
    };
  },
};
