import { Smartphone, X, Share } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from './ui/button';

export function PWAInstallBanner() {
  const { canInstall, installApp, isIOSDevice, shouldShowBanner, dismiss } = usePWAInstall();

  if (!shouldShowBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="m-3 rounded-2xl border border-border bg-background/95 backdrop-blur-lg shadow-2xl p-4">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            {canInstall ? (
              <>
                <p className="text-sm font-semibold text-foreground">Install GS Hub</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add to your home screen for quick access to notices anytime.
                </p>
                <Button
                  size="sm"
                  className="mt-2.5 h-8 text-xs px-4"
                  onClick={installApp}
                >
                  Add to Home Screen
                </Button>
              </>
            ) : isIOSDevice ? (
              <>
                <p className="text-sm font-semibold text-foreground">Install GS Hub</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Tap the{' '}
                  <Share className="w-3 h-3 inline-block align-middle" />
                  {' '}Share button, then{' '}
                  <span className="font-medium text-foreground">"Add to Home Screen"</span>.
                </p>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
