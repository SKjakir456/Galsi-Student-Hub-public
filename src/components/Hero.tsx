import { Bell, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import logo from '@/assets/logo.png';

export function Hero() {
  return (
    <section className="relative min-h-[45vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-14 md:pt-20 pb-4 md:pb-0">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-pattern opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge - Hidden on mobile for space */}
          <div 
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 animate-fade-in"
            style={{ animationDelay: '0.1s' }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              NAAC Accredited with Grade 'B' (Cycle-1)
            </span>
          </div>

          {/* College Logo - Smaller on mobile */}
          <div 
            className="mb-4 md:mb-6 animate-fade-in"
            style={{ animationDelay: '0.15s' }}
          >
            <img 
              src={logo} 
              alt="GS Hub Logo" 
              className="w-36 h-36 md:w-52 md:h-52 mx-auto object-contain"
            />
          </div>

          {/* Heading - Compact on mobile */}
          <h1 
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2 md:mb-4 animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            <span className="gradient-text">GS Hub</span>
          </h1>

          {/* Bengali Name - Smaller on mobile */}
          <p 
            className="text-base md:text-2xl text-muted-foreground mb-1 md:mb-2 animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            গলসী মহাবিদ্যালয়
          </p>

          {/* Subtitle - Compact on mobile */}
          <p 
            className="text-xs md:text-lg text-muted-foreground max-w-2xl mx-auto mb-2 md:mb-4 leading-relaxed animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            Estd: 2007 • Government Aided • Affiliated to The University of Burdwan
          </p>

          {/* Description - Hidden on mobile */}
          <p 
            className="hidden md:block text-sm md:text-base text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed animate-fade-in-up"
            style={{ animationDelay: '0.5s' }}
          >
            Access the latest notices, academic updates, and important links — 
            all in one student-friendly dashboard.
          </p>

          {/* CTAs - Compact on mobile */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-4 mb-6 md:mb-16 animate-fade-in-up"
            style={{ animationDelay: '0.6s' }}
          >
            <Button variant="hero" size="default" className="md:hidden gap-2" asChild>
              <a href="#notices">
                <Bell className="w-4 h-4" />
                View Notices
              </a>
            </Button>
            <Button variant="hero" size="xl" className="hidden md:inline-flex gap-3" asChild>
              <a href="#notices">
                <Bell className="w-5 h-5" />
                View Latest Notices
              </a>
            </Button>
            <Button variant="hero-secondary" size="default" className="md:hidden gap-2" asChild>
              <a href="https://wbcap.in/" target="_blank" rel="noopener noreferrer">
                Admission 2025-26
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
            <Button variant="hero-secondary" size="xl" className="hidden md:inline-flex gap-2" asChild>
              <a href="https://wbcap.in/" target="_blank" rel="noopener noreferrer">
                Online Admission 2025-26
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>

          {/* Scroll Indicator - Hidden on mobile */}
          <div 
            className="hidden md:block animate-fade-in"
            style={{ animationDelay: '0.8s' }}
          >
            <a
              href="#notices"
              className="inline-flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              <span className="text-sm font-medium">Scroll to explore</span>
              <div className="w-8 h-12 rounded-full border-2 border-current flex items-start justify-center p-2">
                <div className="w-1.5 h-3 bg-current rounded-full animate-bounce" />
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
