import { i18n } from 'astro:config/client';
import { getRelativeLocaleUrl } from 'astro:i18n';
import { ui } from './ui';

/**
 * @import { Locale, UIStringKey } from './ui'
 */

export const defaultLocale = /** @type {Locale} */ (i18n?.defaultLocale);
export const locales = /** @type {Locale[]} */ (i18n?.locales);

/**
 * Get all the locales with their `getStaticPaths` params for the `[lang]` route segment.
 */
export const getLocaleRoutes = () =>
  locales.map((locale) => ({ locale, params: { lang: locale } }));

/**
 * Get `getStaticPaths` params for all the locales.
 */
export const getLocaleParams = () => getLocaleRoutes().map(({ params }) => params);

/**
 * Get the current page locale.
 * @param {string | undefined} currentLocale `Astro.currentLocale`.
 * @returns {Locale} Locale.
 */
export const getLocale = (currentLocale) =>
  locales.includes(/** @type {Locale} */ (currentLocale))
    ? /** @type {Locale} */ (currentLocale)
    : defaultLocale;

/**
 * Get a localized URL path.
 * @param {Locale} locale Locale.
 * @param {string} [path] Path without the locale prefix, e.g. `/about/`.
 * @returns {string} Path.
 */
export const localizePath = (locale, path = '/') =>
  // Avoid adding a trailing slash to a file path like `/index.xml`
  /\.\w+$/.test(path)
    ? `${getRelativeLocaleUrl(locale)}${path.replace(/^\//, '')}`
    : getRelativeLocaleUrl(locale, path.replace(/^\//, ''));

/**
 * Get a function to look up localized UI strings. `{name}` placeholders are replaced with the
 * given values.
 * @param {Locale} locale Locale.
 * @returns {(key: UIStringKey, values?: Record<string, string | number>) => string} Function.
 */
export const useTranslations =
  (locale) =>
  (key, values = {}) =>
    /** @type {string} */ ((ui[locale] ?? ui[defaultLocale])[key]).replace(
      /{(\w+)}/g,
      (match, name) => (name in values ? String(values[name]) : match),
    );

/**
 * Formatter to get numeric date parts in the site’s time zone.
 */
const dateFormatter = new Intl.DateTimeFormat('en', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});

/**
 * Format a date in the site’s time zone.
 * @param {Locale} locale Locale.
 * @param {Date} date Date.
 * @param {'short' | 'long'} [style] `short` (month and day) or `long` (year, month and day).
 * @returns {string} Formatted date.
 */
export const formatDate = (locale, date, style = 'long') => {
  const parts = Object.fromEntries(
    dateFormatter.formatToParts(date).map(({ type, value }) => [type, value]),
  );

  return useTranslations(locale)(style === 'short' ? 'date.short' : 'date.long', parts);
};
