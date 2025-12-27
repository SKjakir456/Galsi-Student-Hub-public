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

export const noticesApi = {
  async fetchNotices(): Promise<NoticesResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('scrape-notices');

      if (error) {
        console.error('Error fetching notices:', error);
        return { success: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Error fetching notices:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notices';
      return { success: false, error: errorMessage };
    }
  },
};