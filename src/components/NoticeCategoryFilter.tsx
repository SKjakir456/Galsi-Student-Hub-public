import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { 
  LayoutGrid, 
  BarChart2, 
  Calendar, 
  BookOpen, 
  ClipboardList, 
  GraduationCap, 
  Award, 
  PartyPopper, 
  AlertTriangle,
  LucideIcon
} from 'lucide-react';

interface NoticeCategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  categoryCounts: Record<string, number>;
}

const CATEGORIES: { id: string | null; label: string; icon: LucideIcon }[] = [
  { id: null, label: 'All', icon: LayoutGrid },
  { id: 'result', label: 'Result', icon: BarChart2 },
  { id: 'routine', label: 'Routine', icon: Calendar },
  { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
  { id: 'exam', label: 'Exam', icon: ClipboardList },
  { id: 'admission', label: 'Admission', icon: GraduationCap },
  { id: 'scholarship', label: 'Scholarship', icon: Award },
  { id: 'holiday', label: 'Holiday', icon: PartyPopper },
  { id: 'important', label: 'Important', icon: AlertTriangle },
];

export function NoticeCategoryFilter({ 
  selectedCategory, 
  onCategoryChange, 
  categoryCounts 
}: NoticeCategoryFilterProps) {
  const totalCount = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
  
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        {CATEGORIES.map(({ id, label, icon: Icon }) => {
          const count = id === null ? totalCount : (categoryCounts[id] || 0);
          const isActive = selectedCategory === id;
          
          // Hide categories with 0 count (except "All")
          if (id !== null && count === 0) return null;
          
          return (
            <button
              key={id || 'all'}
              onClick={() => onCategoryChange(id)}
              className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-200 flex-shrink-0
                ${isActive 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              <span className={`
                text-xs px-1.5 py-0.5 rounded-full
                ${isActive 
                  ? 'bg-primary-foreground/20 text-primary-foreground' 
                  : 'bg-background/50 text-muted-foreground'
                }
              `}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" className="h-1.5" />
    </ScrollArea>
  );
}