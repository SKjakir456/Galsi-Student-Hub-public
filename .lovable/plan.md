

## Seamless Interactive Scroll Animations

### What changes

**1. One-time reveal** (`src/hooks/useScrollReveal.ts`)
- Animations trigger once and stay visible -- no more flickering when scrolling back up
- Disconnect observer after the element appears for better performance

**2. Smoother, more polished CSS transitions** (`src/index.css`)
- Longer, smoother transitions (1s duration) with a refined cubic-bezier easing
- Subtle scale-up effect (0.97 to 1) alongside the translateY for a more "interactive" feel
- Extend stagger support to 10+ children with tighter 80ms delays for a faster cascade
- Add a slight blur-in effect for a modern, polished entrance

**3. Files to modify**
- `src/hooks/useScrollReveal.ts` -- animate-once logic, disconnect observer after reveal
- `src/index.css` -- refined `.reveal` and `.stagger-children` CSS with scale + blur effects

### Technical Details

- **useScrollReveal**: When `entry.isIntersecting` is true, set `isVisible(true)` and immediately `observer.unobserve(element)`. Remove the else branch that resets visibility.
- **`.reveal` CSS**: Change initial state to `opacity: 0; transform: translateY(24px) scale(0.97); filter: blur(4px)`. Transition includes opacity, transform, and filter over 1s.
- **`.reveal.visible`**: `opacity: 1; transform: translateY(0) scale(1); filter: blur(0)`.
- **`.stagger-children`**: Add nth-child rules up to 10 with 80ms increments. Add matching scale and blur to children transitions.

