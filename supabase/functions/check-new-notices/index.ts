import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
const CATEGORY_KEYWORDS = {
  result: ['result', 'grade card', 'marksheet', 'marks', 'score'],
  routine: ['routine', 'schedule', 'time table', 'timetable', 'class schedule'],
  syllabus: ['syllabus', 'curriculum', 'course outline', 'course structure'],
  exam: ['exam', 'examination', 'test', 'assessment'],
  admission: ['admission', 'registration', 'enrollment', 'enrolment'],
  scholarship: ['scholarship', 'stipend', 'kanyashree', 'aikyashree', 'oasis', 'svmcm'],
  holiday: ['holiday', 'vacation', 'leave', 'closed'],
  important: ['urgent', 'important', 'notice', 'form fill', 'form submission', 'last date', 'deadline'],
};

const CATEGORY_EMOJIS: Record<string, string> = {
  result: "📊",
  routine: "📅",
  syllabus: "📚",
  exam: "📝",
  admission: "🎓",
  scholarship: "💰",
  holiday: "🎉",
  important: "⚠️",
  general: "📋",
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== Starting automatic notice check ===");
    console.log("Time:", new Date().toISOString());

    // Check if this is a manual trigger
    let triggeredBy = "auto";
    try {
      const body = await req.json();
      if (body?.triggeredBy) {
        triggeredBy = body.triggeredBy;
      }
    } catch {
      // No body or invalid JSON, default to auto
    }

    console.log("Triggered by:", triggeredBy);

    const firecrawlApiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlApiKey) {
      console.error("FIRECRAWL_API_KEY not set");
      return new Response(
        JSON.stringify({ error: "Scraper not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check subscriber count
    const { count: subscriberCount, error: subError } = await supabase
      .from("push_subscriptions")
      .select("id", { count: 'exact', head: true });

    if (subError) {
      console.error("Error checking subscribers:", subError);
    }

    const totalSubscribers = subscriberCount || 0;
    console.log("Total subscribers:", totalSubscribers);

    if (totalSubscribers === 0) {
      console.log("No subscribers, skipping scrape");
      return new Response(
        JSON.stringify({ message: "No subscribers", skipped: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Scrape the notices page
    const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${firecrawlApiKey}`,
      },
      body: JSON.stringify({
        url: "https://galsimahavidyalaya.ac.in/category/notice/",
        formats: ["markdown", "links"],
        onlyMainContent: true,
      }),
    });

    if (!scrapeResponse.ok) {
      const errorText = await scrapeResponse.text();
      console.error("Firecrawl error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to scrape website" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const scrapeData = await scrapeResponse.json();
    const markdown = scrapeData.data?.markdown || scrapeData.markdown || "";
    const links = scrapeData.data?.links || scrapeData.links || [];

    console.log("Scraped markdown length:", markdown.length);
    console.log("Scraped links count:", links.length);

    // Parse notices from the table format
    const notices: Notice[] = [];
    const tableRowRegex = /\|\s*(\d+)\s*\|\s*(\d{1,2}-\d{1,2}-\d{4})\s*\|\s*([^|]+)\s*\|/g;
    const currentDate = new Date();
    
    let match;
    while ((match = tableRowRegex.exec(markdown)) !== null && notices.length < 30) {
      const slNo = match[1];
      const dateStr = match[2].trim();
      const title = match[3].trim();
      
      if (title.length < 5 || title.toLowerCase().includes('subject')) continue;
      
      const [day, month, year] = dateStr.split('-').map(Number);
      const parsedDate = new Date(year, month - 1, day);
      const daysDiff = Math.floor((currentDate.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const isNew = daysDiff <= 3 && daysDiff >= 0;
      const category = categorizeNotice(title);
      const isImportant = isHighPriority(title, category);
      
      let noticeUrl = "https://galsimahavidyalaya.ac.in/category/notice/";
      const titleWords = title.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
      
      const matchingLink = links.find((link: string) => {
        if (!link.includes('.pdf')) return false;
        const linkLower = link.toLowerCase();
        return titleWords.slice(0, 3).some((word: string) => linkLower.includes(word));
      });
      
      if (matchingLink) {
        noticeUrl = matchingLink;
      }
      
      notices.push({
        id: `notice-${slNo}`,
        title,
        date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        url: noticeUrl,
        isNew,
        isImportant,
        category,
      });
    }

    console.log(`Parsed ${notices.length} notices`);

    // Get previously seen notices
    const { data: seenNotices, error: seenError } = await supabase
      .from("seen_notices")
      .select("title");

    if (seenError) {
      console.error("Error fetching seen notices:", seenError);
    }

    const seenTitles = new Set((seenNotices || []).map((n: { title: string }) => n.title));
    console.log(`Previously seen: ${seenTitles.size} notices`);

    // Find new notices
    const newNotices = notices.filter((n) => {
      const notSeen = !seenTitles.has(n.title);
      const shouldNotify = n.isNew || n.isImportant;
      return notSeen && shouldNotify;
    });

    console.log(`New notices to notify: ${newNotices.length}`);

    if (newNotices.length === 0) {
      console.log("No new notices to notify about");
      return new Response(
        JSON.stringify({ 
          message: "No new notices", 
          checked: notices.length,
          previouslySeen: seenTitles.size,
          newNotices: 0,
          notificationsSent: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark notices as seen
    const { error: insertError } = await supabase.from("seen_notices").insert(
      newNotices.map((n) => ({ 
        title: n.title, 
        first_seen: new Date().toISOString() 
      }))
    );

    if (insertError) {
      console.error("Error marking notices as seen:", insertError);
    }

    // Send push notifications (limit to 5 at a time)
    const noticesToNotify = newNotices.slice(0, 5);
    let totalSuccessful = 0;
    let totalFailed = 0;
    
    for (const notice of noticesToNotify) {
      try {
        const emoji = CATEGORY_EMOJIS[notice.category] || "📋";
        let notifTitle = `${emoji} New ${notice.category.charAt(0).toUpperCase() + notice.category.slice(1)}`;
        
        if (notice.isImportant && notice.category !== 'important') {
          notifTitle = `🔔 ${notifTitle}`;
        }

        console.log(`Sending notification: ${notifTitle} - ${notice.title}`);

        const response = await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            title: notifTitle,
            body: notice.title,
            url: "/#notices",
          }),
        });

        const result = await response.json();
        const sent = result.sent || 0;
        const failed = result.failed || 0;
        
        totalSuccessful += sent;
        totalFailed += failed;

        // Log to notification history
        await supabase.from("notification_history").insert({
          notice_title: notice.title,
          category: notice.category,
          subscribers_count: totalSubscribers,
          successful: sent,
          failed: failed,
          triggered_by: triggeredBy,
        });

        console.log(`Notification sent for: ${notice.title} (${sent} success, ${failed} failed)`);
        
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Failed to send notification for ${notice.title}:`, error);
        totalFailed++;
        
        // Log failed notification
        await supabase.from("notification_history").insert({
          notice_title: notice.title,
          category: notice.category,
          subscribers_count: totalSubscribers,
          successful: 0,
          failed: 1,
          triggered_by: triggeredBy,
        });
      }
    }

    console.log("=== Notice check completed ===");

    return new Response(
      JSON.stringify({
        message: "Checked for new notices",
        totalScraped: notices.length,
        newNotices: newNotices.length,
        notificationsSent: noticesToNotify.length,
        successful: totalSuccessful,
        failed: totalFailed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const error = err as Error;
    console.error("Error checking notices:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});