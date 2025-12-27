import { Heart, ExternalLink, AlertTriangle } from 'lucide-react';
import logo from '@/assets/logo.png';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 glass-card rounded-none border-x-0 border-b-0">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="GS Hub Logo" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <span className="font-bold text-foreground block">
                GS Hub
              </span>
              <p className="text-xs text-muted-foreground">
                Galsi Student Hub
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <a href="#notices" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
              Notices
            </a>
            <a href="#quick-links" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
              Quick Links
            </a>
            <a href="#departments" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
              Departments
            </a>
            <a 
              href="https://galsimahavidyalaya.ac.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center gap-1"
            >
              Official Website
              <ExternalLink className="w-3 h-3" />
            </a>
          </nav>

          {/* Author Credit */}
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 justify-center md:justify-end">
              Designed & Developed with <Heart className="w-3.5 h-3.5 text-destructive fill-destructive" /> by{' '}
              <span className="font-semibold text-primary">Jakir</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              © {currentYear} All rights reserved.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <div className="flex items-start gap-2 justify-center text-center">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground max-w-2xl">
              <span className="font-medium">Disclaimer:</span> This is an unofficial student helper app. 
              Notices are sourced from{' '}
              <a 
                href="https://galsimahavidyalaya.ac.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                galsimahavidyalaya.ac.in
              </a>. 
              Not affiliated with college administration. Always verify important information from official sources.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
