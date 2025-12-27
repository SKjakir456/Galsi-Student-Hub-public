import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface NoticeSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function NoticeSearch({ value, onChange }: NoticeSearchProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`relative transition-all duration-300 ${isFocused ? 'w-full sm:w-72' : 'w-full sm:w-56'}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-muted-foreground" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search notices..."
        className="w-full pl-9 pr-8 py-2 text-sm rounded-xl glass-card border-0 bg-secondary/50 focus:bg-card focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 text-foreground placeholder:text-muted-foreground"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}