import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  gradient?: string;
}

export function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
}: QuickActionCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="glass-card-elevated p-5 md:p-6 hover-lift group cursor-pointer block"
    >
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center group-hover:from-primary/25 group-hover:to-accent/20 transition-all duration-300 border border-primary/10">
          <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        </div>
        <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
      </div>
      <h3 className="text-base md:text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </a>
  );
}
