import campusBg from '@/assets/campus-bg-2.jpg';
import { useParallax } from '@/hooks/useParallax';

export function BackgroundImage() {
  const parallaxOffset = useParallax(0.5);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden h-screen">
      {/* Campus background image with parallax effect */}
      <img
        src={campusBg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-[150%] object-cover object-center blur-[2px] will-change-transform"
        style={{ transform: `translateY(-${parallaxOffset}px)` }}
      />
      {/* Light mode subtle overlay */}
      <div 
        className="absolute inset-0 dark:hidden"
        style={{
          background: `linear-gradient(
            180deg,
            hsl(165 25% 97% / 0.55) 0%,
            hsl(165 25% 97% / 0.65) 50%,
            hsl(165 25% 97% / 0.85) 100%
          )`,
        }}
      />
      {/* Dark mode overlay */}
      <div 
        className="absolute inset-0 hidden dark:block"
        style={{
          background: `linear-gradient(
            180deg,
            hsl(195 30% 8% / 0.6) 0%,
            hsl(195 30% 8% / 0.75) 50%,
            hsl(195 30% 8% / 0.9) 100%
          )`,
        }}
      />
    </div>
  );
}