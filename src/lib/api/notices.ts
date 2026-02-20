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

// Try to fetch using different methods
async function fetchWithMethod(url: string, method: string): Promise<{ ok: boolean; text?: string; error?: string }> {
  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}` };
    }

    const text = await response.text();
    return { ok: true, text };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

async function scrapeDirectly(): Promise<NoticesResponse> {
  const targetUrl = 'https://galsimahavidyalaya.ac.in/category/notice/';

  // Try multiple approaches
  const approaches = [
    // Direct fetch
    async () => {
      return fetchWithMethod(targetUrl, 'GET');
    },
    // Via textise dot iitty (textise dot iitty is a text-only version)
    async () => {
      const response = await fetch('https://r.jina.ai/' + encodeURIComponent(targetUrl));
      if (response.ok) {
        const text = await response.text();
        return { ok: true, text };
      }
      return { ok: false, error: 'Jina AI failed' };
    },
    // Via textise dot iitty alternative - using textise dot iitty
    async () => {
      const response = await fetch('https://r.jina.ai/http://' + targetUrl.replace('https://', ''));
      if (response.ok) {
        const text = await response.text();
        return { ok: true, text };
      }
      return { ok: false, error: 'Jina AI v2 failed' };
    },
  ];

  let html = '';
  let lastError = '';

  for (let i = 0; i < approaches.length; i++) {
    try {
      const result = await approaches[i]();
      if (result.ok && result.text && result.text.length > 100) {
        html = result.text;
        console.log('Scraping method', i, 'succeeded');
        break;
      }
      lastError = result.error || 'Empty response';
      console.log('Scraping method', i, 'failed:', lastError);
    } catch (e) {
      lastError = (e as Error).message;
      console.log('Scraping method', i, 'error:', lastError);
    }
  }

  if (!html) {
    // Last resort - try Google cache
    try {
      const cacheUrl = 'https://webcache.googleusercontent.com/search?q=cache:' + targetUrl;
      const result = await fetchWithMethod(cacheUrl, 'GET');
      if (result.ok && result.text) {
        html = result.text;
        console.log('Google cache worked!');
      }
    } catch (e) {
      console.log('Google cache failed:', e);
    }
  }

  if (!html) {
    return { success: false, error: 'All scraping methods failed: ' + lastError };
  }

  const notices: Notice[] = [];
  const currentDate = new Date();

  // Try multiple regex patterns to extract notices
  const patterns = [
    // Pattern 1: Table rows
    /<tr>\s*<td[^>]*>(\d+)<\/td>\s*<td[^>]*>(\d{1,2}-\d{1,2}-\d{4})<\/td>\s*<td[^>]*>([^<]+)<\/td>\s*<td[^>]*>\s*<a\s+href="([^"]+)"[^>]*>/gi,
    // Pattern 2: List items
    /<li[^>]*>.*?<a[^>]+href="([^"]+\.pdf)"[^>]*>([^<]+)<\/a>.*?(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}).*?<\/li>/gi,
    // Pattern 3: Article links
    /<article[^>]*>.*?<a[^>]+href="([^"]+\.pdf)"[^>]*>([^<]+)<\/a>.*?<\/article>/gi,
    // Pattern 4: Simple link with date
    /<a[^>]+href="([^"]*notice[^"]*\.pdf)"[^>]*>([^<]+)<\/a>.*?(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/gi,
  ];

  for (const pattern of patterns) {
    const matches = [...html.matchAll(pattern)];
    console.log('Pattern found', matches.length, 'matches');

    for (const match of matches) {
      if (notices.length >= 20) break;

      try {
        let title: string, dateStr: string, pdfUrl: string;

        if (pattern === patterns[0]) {
          // Table row
          pdfUrl = match[4].trim();
          title = match[3].trim().replace(/&/g, '&').replace(/&#8217;/g, "'").replace(/&#8211;/g, '-');
          dateStr = match[2].trim();
        } else {
          // Other patterns
          pdfUrl = match[1].trim();
          title = match[2].trim().replace(/&/g, '&').replace(/&#8217;/g, "'").replace(/&#8211;/g, '-');
          dateStr = match[3] ? match[3].trim() : '';
        }

        if (!pdfUrl || pdfUrl === '#' || !pdfUrl.includes('.')) continue;

        // Make absolute URL
        if (pdfUrl.startsWith('/')) {
          pdfUrl = 'https://galsimahavidyalaya.ac.in' + pdfUrl;
        } else if (!pdfUrl.startsWith('http')) {
          pdfUrl = 'https://galsimahavidyalaya.ac.in/' + pdfUrl;
        }

        // Parse date
        let parsedDate = new Date();
        let isNew = false;

        if (dateStr) {
          const parts = dateStr.split(/[-\/]/);
          if (parts.length === 3) {
            let [day, month, year] = parts.map(Number);
            if (year < 100) year += 2000;
            parsedDate = new Date(year, month - 1, day);
            const daysDiff = Math.floor((currentDate.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24));
            isNew = daysDiff <= 7 && daysDiff >= 0;
          }
        }

        const category = categorizeNotice(title);
        const isImportant = isHighPriority(title, category);

        notices.push({
          id: `notice-${notices.length + 1}`,
          title: title.substring(0, 200),
          date: `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`,
          url: pdfUrl,
          isNew,
          isImportant,
          category,
        });
      } catch (e) {
        console.log('Error parsing match:', e);
      }
    }

    if (notices.length > 0) break;
  }

  if (notices.length === 0) {
    // Try to extract any PDF links from the page
    const pdfLinkRegex = /href="(https?:\/\/[^"]+\.pdf)"/gi;
    const pdfMatches = [...html.matchAll(pdfLinkRegex)];
    console.log('Found', pdfMatches.length, 'PDF links');

    for (const match of pdfMatches.slice(0, 10)) {
      const pdfUrl = match[1];
      const filename = pdfUrl.split('/').pop()?.replace(/-/g, ' ').replace(/_/g, ' ') || 'Notice';

      notices.push({
        id: `notice-${notices.length + 1}`,
        title: filename.substring(0, 100),
        date: new Date().toISOString().split('T')[0],
        url: pdfUrl,
        isNew: true,
        isImportant: false,
        category: 'general',
      });
    }
  }

  notices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (notices.length === 0) {
    return { success: false, error: 'Could not extract notices from page' };
  }

  return {
    success: true,
    notices: notices.slice(0, 30),
    scrapedAt: new Date().toISOString()
  };
}

// Fallback sample notices
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
];

export const noticesApi = {
  async fetchNotices(): Promise<NoticesResponse> {
    // Try to scrape the college website
    const result = await scrapeDirectly();

    if (result.success && result.notices && result.notices.length > 0) {
      return result;
    }

    // Fallback to sample notices
    console.log('Using sample notices (scraping failed)');
    return {
      success: true,
      notices: SAMPLE_NOTICES,
      scrapedAt: new Date().toISOString(),
    };
  },
};
