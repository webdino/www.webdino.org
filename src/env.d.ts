// Globals used by the inline Google Analytics (`gtag.js`) snippet in `BaseLayout.astro`. Types
// can’t be declared globally in JavaScript, so this is the only TypeScript file.

interface Window {
  dataLayer: unknown[];
}

declare var dataLayer: unknown[];
