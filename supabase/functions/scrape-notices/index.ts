const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Notice {
  id: string;
  title: string;
  date: string;
  url: string;
  isNew: boolean;
  isImportant: boolean;
  category: string;
}

// Keywords for categorizing notices
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Scraping notices from Galsi Mahavidyalaya notices page...');

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://galsimahavidyalaya.ac.in/category/notice/',
        formats: ['html'],
        onlyMainContent: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Request failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Scrape successful, parsing notices from HTML...');

    const html = data.data?.html || data.html || '';
    console.log('HTML length:', html.length);

    const notices: Notice[] = [];
    const currentDate = new Date();
    
    // Parse HTML table rows directly
    // HTML structure: <tr><td>Sl No</td><td>Date</td><td>Title</td><td><a href="PDF_URL">...</a></td></tr>
    const tableRowRegex = /<tr>\s*<td[^>]*>(\d+)<\/td>\s*<td[^>]*>(\d{1,2}-\d{1,2}-\d{4})<\/td>\s*<td[^>]*>([^<]+)<\/td>\s*<td[^>]*>\s*<a\s+href="([^"]+)"[^>]*>/gi;
    
    let match;
    while ((match = tableRowRegex.exec(html)) !== null && notices.length < 50) {
      const slNo = match[1].trim();
      const dateStr = match[2].trim();
      const title = match[3].trim().replace(/&amp;/g, '&').replace(/&#8217;/g, "'").replace(/&#8211;/g, '-');
      const pdfUrl = match[4].trim();
      
      // Skip if no valid PDF URL
      if (!pdfUrl || pdfUrl === '#') continue;
      
      const [day, month, year] = dateStr.split('-').map(Number);
      const parsedDate = new Date(year, month - 1, day);
      
      const daysDiff = Math.floor((currentDate.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24));
      const isNew = daysDiff <= 3 && daysDiff >= 0;
      
      const category = categorizeNotice(title);
      const isImportant = isHighPriority(title, category);
      
      notices.push({
        id: `notice-${slNo}`,
        title: title,
        date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        url: pdfUrl,
        isNew,
        isImportant,
        category,
      });
    }

    console.log(`Parsed ${notices.length} notices with direct PDF URLs`);

    // Sort by date descending (newest first)
    notices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return new Response(
      JSON.stringify({ 
        success: true, 
        notices,
        scrapedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping notices:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape notices';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
