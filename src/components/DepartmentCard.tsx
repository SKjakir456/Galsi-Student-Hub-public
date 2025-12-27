import { ChevronDown, ChevronUp, ExternalLink, Download, BookOpen, Calendar, FileText, GraduationCap, Loader2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Teacher {
  name: string;
  designation: string;
  qualification?: string;
}

interface DownloadableItem {
  title: string;
  url: string;
  type: 'pdf' | 'doc' | 'link';
}

interface DepartmentData {
  name: string;
  href: string;
  color: string;
  about: string;
  teachers: Teacher[];
  syllabus: DownloadableItem[];
  routine: DownloadableItem[];
  results: DownloadableItem[];
  notices: DownloadableItem[];
}

interface DepartmentCardProps {
  department: DepartmentData;
  isOpen: boolean;
  onToggle: () => void;
}

export function DepartmentCard({ department, isOpen, onToggle }: DepartmentCardProps) {
  const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);

  const handleDownload = async (item: DownloadableItem) => {
    setDownloadingUrl(item.url);
    
    try {
      const { data, error } = await supabase.functions.invoke('proxy-download', {
        body: { url: item.url }
      });

      if (error) {
        // Check if it's a 404 (file not found on source)
        if (error.message?.includes('404') || error.message?.includes('non-2xx')) {
          toast.error('File not available', { 
            description: 'This file may have been moved or removed from the source website.' 
          });
          return;
        }
        throw error;
      }

      // Create blob and trigger download
      const blob = new Blob([data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = item.title.replace(/[^a-zA-Z0-9\s]/g, '') + '.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      
      toast.success('Downloaded!', { description: item.title });
    } catch (error) {
      console.error('Proxy download failed:', error);
      // Fallback to direct link
      window.open(item.url, '_blank', 'noopener,noreferrer');
      toast.info('Opening in new tab...', { description: 'Trying direct download' });
    } finally {
      setDownloadingUrl(null);
    }
  };

  const handleOpenChange = () => {
    onToggle();
  };

  return (
    <Collapsible open={isOpen} onOpenChange={handleOpenChange} className="w-full">
      <div className="glass-card-elevated overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full p-5 md:p-6 text-left group">
            <div className={`absolute inset-0 bg-gradient-to-br ${department.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                    {department.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Honours & General Courses
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={department.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-5 pb-5 md:px-6 md:pb-6">
            <Tabs defaultValue="syllabus" className="w-full">
              <TabsList className="w-full glass-card grid grid-cols-4 gap-1 p-1 h-auto">
                <TabsTrigger value="syllabus" className="text-xs md:text-sm py-2 px-2 data-[state=active]:bg-primary/20 flex items-center justify-center gap-1">
                  <BookOpen className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-[10px] sm:text-xs">Syllabus</span>
                </TabsTrigger>
                <TabsTrigger value="routine" className="text-xs md:text-sm py-2 px-2 data-[state=active]:bg-primary/20 flex items-center justify-center gap-1">
                  <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-[10px] sm:text-xs">Routine</span>
                </TabsTrigger>
                <TabsTrigger value="results" className="text-xs md:text-sm py-2 px-2 data-[state=active]:bg-primary/20 flex items-center justify-center gap-1">
                  <FileText className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-[10px] sm:text-xs">Results</span>
                </TabsTrigger>
                <TabsTrigger value="notices" className="text-xs md:text-sm py-2 px-2 data-[state=active]:bg-primary/20 flex items-center justify-center gap-1">
                  <GraduationCap className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-[10px] sm:text-xs">Notices</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-4">
                <TabsContent value="syllabus" className="mt-0">
                  <DownloadableList 
                    items={department.syllabus} 
                    emptyMessage="Syllabus will be available soon."
                    onDownload={handleDownload}
                    downloadingUrl={downloadingUrl}
                  />
                </TabsContent>

                <TabsContent value="routine" className="mt-0">
                  <DownloadableList 
                    items={department.routine} 
                    emptyMessage="Class routine will be available soon."
                    onDownload={handleDownload}
                    downloadingUrl={downloadingUrl}
                  />
                </TabsContent>

                <TabsContent value="results" className="mt-0">
                  <DownloadableList 
                    items={department.results} 
                    emptyMessage="Results will be published here."
                    onDownload={handleDownload}
                    downloadingUrl={downloadingUrl}
                  />
                </TabsContent>

                <TabsContent value="notices" className="mt-0">
                  <DownloadableList 
                    items={department.notices} 
                    emptyMessage="Department notices will appear here."
                    onDownload={handleDownload}
                    downloadingUrl={downloadingUrl}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function DownloadableList({ 
  items, 
  emptyMessage, 
  onDownload,
  downloadingUrl,
}: { 
  items: DownloadableItem[]; 
  emptyMessage: string; 
  onDownload: (item: DownloadableItem) => void;
  downloadingUrl: string | null;
}) {
  if (items.length === 0) {
    return (
      <div className="glass-card p-4 rounded-xl text-center text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {items.map((item, index) => {
        const isDownloading = downloadingUrl === item.url;
        const isPdf = item.type === 'pdf' || item.url.toLowerCase().includes('.pdf');
        
        return (
          <div 
            key={index} 
            className="glass-card p-4 rounded-xl flex items-center justify-between group hover:bg-primary/5 transition-colors cursor-pointer"
            onClick={() => onDownload(item)}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isPdf ? 'bg-red-500/20' : 'bg-primary/20'}`}>
                <FileText className={`w-5 h-5 ${isPdf ? 'text-red-500' : 'text-primary'}`} />
              </div>
              <div>
                <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-muted-foreground uppercase">
                  {isPdf ? 'PDF Document' : item.type === 'doc' ? 'Word Document' : 'External Link'}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`${isPdf ? 'text-red-500 hover:text-red-600' : 'text-primary'}`}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
