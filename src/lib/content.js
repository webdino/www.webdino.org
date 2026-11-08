import { getCollection, getEntry } from 'astro:content';
import { getLocaleRoutes, useTranslations } from '@i18n/utils';
import { plainify } from './text';

/**
 * @import { CollectionEntry, CollectionKey } from 'astro:content'
 * @import { Locale } from '@i18n/ui'
 */

/**
 * Names of the fixed pages. Each page is a collection named `{name}Page`.
 */
const pageNames = /** @type {const} */ ([
  'home',
  'about',
  'leadership',
  'history',
  'location',
  'services',
  'tech',
  'human',
  'fullstack',
  'community',
  'updates',
  'news',
  'careers',
  'contact',
  'privacy',
  'error',
]);

/**
 * @typedef {(typeof pageNames)[number]} PageName
 * @typedef {`${PageName}Page`} PageCollection
 * @typedef {CollectionEntry<PageCollection>} Page
 * @typedef {CollectionEntry<'news'>} Post
 * @typedef {CollectionEntry<'settings'>['data']} Settings
 */

/**
 * Whether to include posts with a future date. Like Hugo’s `--buildFuture` flag, it’s enabled in
 * development and when the `BUILD_FUTURE` environment variable is `true`, e.g. on Cloudflare Pages
 * preview deployments.
 */
const buildFuture = import.meta.env.DEV || process.env.BUILD_FUTURE === 'true';

/**
 * Get the entry slug without the locale prefix.
 * @param {{ id: string }} entry Collection entry.
 * @returns {string} Slug.
 */
export const getSlug = (entry) => entry.id.split('/').slice(1).join('/');

/**
 * Get the entries of a collection in the given locale.
 * @template {CollectionKey} C
 * @param {C} collection Collection name.
 * @param {Locale} locale Locale.
 * @returns {Promise<CollectionEntry<C>[]>} Entries.
 */
const getLocalizedCollection = (collection, locale) =>
  getCollection(collection, ({ id }) => id.startsWith(`${locale}/`));

/**
 * Get a fixed page.
 * @template {PageName} N
 * @param {Locale} locale Locale.
 * @param {N} name Page name, e.g. `about`.
 * @returns {Promise<CollectionEntry<`${N}Page`>>} Page.
 */
export const getPage = async (locale, name) => {
  const entry = await getEntry(/** @type {PageCollection} */ (`${name}Page`), `${locale}/${name}`);

  if (!entry) {
    throw new Error(`Page not found: ${locale}/${name}`);
  }

  return /** @type {any} */ (entry);
};

/**
 * Get all the fixed pages.
 * @param {Locale} locale Locale.
 * @returns {Promise<Page[]>} Pages.
 */
export const getPages = (locale) => Promise.all(pageNames.map((name) => getPage(locale, name)));

/**
 * Get the content shared across multiple pages.
 * @param {Locale} locale Locale.
 * @returns {Promise<Settings>} Settings.
 */
export const getSettings = async (locale) => {
  const entry = await getEntry('settings', `${locale}/partials`);

  if (!entry) {
    throw new Error(`Settings not found: ${locale}`);
  }

  return entry.data;
};

/**
 * Get published news posts, newest first.
 * @param {Locale} locale Locale.
 * @returns {Promise<Post[]>} Posts.
 */
export const getPosts = async (locale) =>
  (await getLocalizedCollection('news', locale))
    .filter((post) => buildFuture || post.data.date.getTime() <= Date.now())
    .toSorted((a, b) => b.data.date.getTime() - a.data.date.getTime());

/**
 * Get authors or tags keyed by their slug (`title` field).
 * @template {'authors' | 'tags'} C
 * @param {C} collection `authors` or `tags`.
 * @param {Locale} locale Locale.
 * @returns {Promise<Map<string, CollectionEntry<C>['data']>>} Terms.
 */
export const getTaxonomy = async (collection, locale) =>
  new Map(
    (await getLocalizedCollection(collection, locale)).map((entry) => [
      entry.data.title,
      entry.data,
    ]),
  );

/**
 * Get taxonomy terms used in the given posts with their post counts, sorted by slug.
 * @param {Post[]} posts Posts.
 * @param {'authors' | 'tags'} field Field name.
 * @returns {[string, number][]} Term slugs and post counts.
 */
export const getTermCounts = (posts, field) => {
  /** @type {Map<string, number>} */
  const counts = new Map();

  posts.forEach((post) => {
    post.data[field].forEach((term) => counts.set(term, (counts.get(term) ?? 0) + 1));
  });

  return [...counts].toSorted(([a], [b]) => a.localeCompare(b));
};

/**
 * Get a post headline.
 * @param {Locale} locale Locale.
 * @param {Post} post Post.
 * @returns {string} Headline.
 */
export const getHeadline = (locale, post) => {
  const title = plainify(post.data.title);

  return post.data.tags.includes('release')
    ? useTranslations(locale)('post.press-release', { title })
    : title;
};

/**
 * Get `getStaticPaths` routes for the authors or tags used in posts.
 * @template {'authors' | 'tags'} C
 * @param {C} collection `authors` or `tags`.
 */
export const getTermRoutes = async (collection) =>
  (
    await Promise.all(
      getLocaleRoutes().map(async ({ locale, params: { lang } }) => {
        const posts = await getPosts(locale);
        const terms = await getTaxonomy(collection, locale);

        return getTermCounts(posts, collection).flatMap(([slug]) => {
          const term = terms.get(slug);

          return term
            ? [
                {
                  params: { lang, slug },
                  props: {
                    locale,
                    term,
                    posts: posts.filter((post) => post.data[collection].includes(slug)),
                  },
                },
              ]
            : [];
        });
      }),
    )
  ).flat();
