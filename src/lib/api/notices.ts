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

// Direct client-side scraping using a CORS proxy
async function scrapeDirectly(): Promise<NoticesResponse> {
  try {
    // Use a CORS proxy to fetch the college website
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const targetUrl = encodeURIComponent('https://galsimahavidyalaya.ac.in/category/notice/');

    const response = await fetch(proxyUrl + targetUrl);

    if (!response.ok) {
      return { success: false, error: 'Failed to fetch notices from college website' };
    }

    const html = await response.text();
    const notices: Notice[] = [];
    const currentDate = new Date();

    // Parse HTML table rows
    const tableRowRegex = /<tr>\s*<td[^>]*>(\d+)<\/td>\s*<td[^>]*>(\d{1,2}-\d{1,2}-\d{4})<\/td>\s*<td[^>]*>([^<]+)<\/td>\s*<td[^>]*>\s*<a\s+href="([^"]+)"[^>]*>/gi;

    let match;
    while ((match = tableRowRegex.exec(html)) !== null && notices.length < 50) {
      const slNo = match[1].trim();
      const dateStr = match[2].trim();
      const title = match[3].trim().replace(/&amp;/g, '&').replace(/&#8217;/g, "'").replace(/&#8211;/g, '-');
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
  } catch (error) {
    console.error('Direct scrape error:', error);
    return { success: false, error: (error as Error).message };
  }
}

export const noticesApi = {
  async fetchNotices(): Promise<NoticesResponse> {
    // Try Edge Function first
    try {
      const { data, error } = await supabase.functions.invoke('scrape-notices');

      if (!error && data?.success) {
        return data;
      }

      console.log('Edge function not available, trying direct scrape:', error);
    } catch (e) {
      console.log('Edge function error, trying direct scrape:', e);
    }

    // Fall back to direct client-side scraping
    return scrapeDirectly();
  },
};