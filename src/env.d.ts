// Globals used by the inline Google Analytics (`gtag.js`) snippet in `BaseLayout.astro` and the
// Cloudflare Turnstile script on the contact page. Types can’t be declared globally in JavaScript,
// so this is the only TypeScript file.

/** @see https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/ */
interface Turnstile {
  render(container: HTMLElement | string, params?: Record<string, unknown>): string | undefined;
  reset(widgetId?: string): void;
}

interface Window {
  dataLayer: unknown[];
  turnstile?: Turnstile;
}

declare var dataLayer: unknown[];
