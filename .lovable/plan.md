
## PWA Install Support + Notice Bookmarks

Both features together — install support makes it a proper mobile app, bookmarks make daily student use much more practical.

---

### Feature 1: PWA Install Support

Makes the app installable on Android and iPhone home screens, working offline like a native app.

**What changes:**

**`vite.config.ts`** — Add `vite-plugin-pwa` configuration:
- App manifest: name "GS Hub", short_name "GS Hub", theme color, icons
- Service worker strategy: `NetworkFirst` for API calls, `CacheFirst` for assets
- Exclude `/~oauth` from the service worker navigation fallback (required for auth safety)
- Since there's already a custom `public/sw.js` for push notifications, we configure the PWA plugin to not conflict with it by using `injectManifest` mode and keeping push logic in the existing service worker

**`index.html`** — Add PWA meta tags:
- `theme-color`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`
- Apple touch icon link
- `manifest.json` link

**`public/manifest.json`** _(new file)_ — Web app manifest:
```json
{
  "name": "GS Hub - Galsi Student Hub",
  "short_name": "GS Hub",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#4f46e5",
  "background_color": "#ffffff",
  "icons": [{ "src": "/logo.png", "sizes": "512x512", "type": "image/png" }]
}
```

**`src/hooks/usePWAInstall.ts`** _(new file)_ — Custom hook:
- Listens for the `beforeinstallprompt` browser event
- Stores the prompt and exposes `canInstall`, `installApp()` functions
- Detects if already installed via `display-mode: standalone`

**`src/components/PWAInstallBanner.tsx`** _(new file)_ — Install prompt UI:
- A subtle sticky banner at the bottom on mobile only
- "Add to Home Screen" button that triggers the native install prompt
- Dismissable (remembers dismissal in `localStorage`)
- Also shows iOS instructions (since iOS doesn't support `beforeinstallprompt`)

**`src/pages/Index.tsx`** — Import and render `<PWAInstallBanner />`

---

### Feature 2: Notice Bookmarks

Lets students save important notices locally and view them anytime — even offline.

**What changes:**

**`src/hooks/useBookmarks.ts`** _(new file)_ — Bookmark logic:
- Stores bookmarked notices in `localStorage` as `galsi_bookmarks`
- Exposes: `bookmarks`, `toggleBookmark(notice)`, `isBookmarked(id)`, `clearBookmarks()`

**`src/components/NoticeCard.tsx`** — Add bookmark button:
- A `Bookmark` / `BookmarkCheck` icon button in the action row
- Filled/colored when bookmarked, outline when not
- No visual clutter — fits alongside existing Open + Download buttons

**`src/components/BookmarksPanel.tsx`** _(new file)_ — Saved notices drawer:
- A slide-in Sheet/Drawer component
- Lists all bookmarked notices with the same card layout
- Empty state: "No bookmarks yet — tap the bookmark icon on any notice"
- Clear all button

**`src/components/NoticesSection.tsx`** — Add bookmarks button in the header toolbar:
- A `Bookmark` icon button next to the Refresh button that opens `BookmarksPanel`
- Shows a count badge when there are bookmarks (e.g., a small red dot or number)

---

### Technical Details

- PWA plugin: `vite-plugin-pwa` (needs to be added as a dev dependency)
- Bookmarks are stored entirely in `localStorage` — no backend needed, works offline
- The existing push notification service worker (`public/sw.js`) is kept as-is; the PWA manifest is added separately without conflicting
- The install banner only shows on mobile (using CSS `md:hidden` or JS `navigator.userAgent` check) and only when the app is not already installed
- iOS detection: check `navigator.standalone` and `userAgent` for Safari on iPhone/iPad to show manual instructions ("Tap Share → Add to Home Screen")

### Files to create/modify

| File | Action |
|---|---|
| `vite.config.ts` | Modify — add vite-plugin-pwa |
| `index.html` | Modify — add PWA meta tags + manifest link |
| `public/manifest.json` | Create |
| `src/hooks/usePWAInstall.ts` | Create |
| `src/components/PWAInstallBanner.tsx` | Create |
| `src/hooks/useBookmarks.ts` | Create |
| `src/components/NoticeCard.tsx` | Modify — add bookmark button |
| `src/components/BookmarksPanel.tsx` | Create |
| `src/components/NoticesSection.tsx` | Modify — add bookmarks toolbar button with badge |
| `src/pages/Index.tsx` | Modify — render PWAInstallBanner |
