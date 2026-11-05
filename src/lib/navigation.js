import { localizePath } from '@i18n/utils';
import { getPage, getSlug } from './content';

/**
 * @import { Locale } from '@i18n/ui'
 * @import { Page, PageName, Post } from './content'
 */

/**
 * @typedef {object} NavItem
 * @property {string} id Section name, used for the `data-section` attribute.
 * @property {string} label Link label.
 * @property {string} href Link URL.
 * @property {NavItem[]} children Child items.
 */

/**
 * @typedef {object} NavDefinition
 * @property {PageName} page Page name.
 * @property {NavDefinition[]} [children] Child items.
 */

/**
 * @typedef {object} Crumb
 * @property {string} label Link label.
 * @property {string} href Link URL.
 */

/**
 * Parent of each fixed page. The others are at the top level, and page paths follow this hierarchy,
 * e.g. `/services/human/fullstack/`.
 * @type {Partial<Record<PageName, PageName>>}
 */
const parents = {
  leadership: 'about',
  history: 'about',
  location: 'about',
  tech: 'services',
  human: 'services',
  fullstack: 'human',
  news: 'updates',
};

/** @type {NavDefinition[]} */
const primary = [
  {
    page: 'about',
    children: [{ page: 'leadership' }, { page: 'history' }, { page: 'location' }],
  },
  {
    page: 'services',
    children: [{ page: 'tech' }, { page: 'human' }],
  },
  { page: 'community' },
  { page: 'updates' },
  { page: 'careers' },
];

/** @type {NavDefinition[]} */
const secondary = [{ page: 'contact' }, { page: 'careers' }];

/**
 * Get a page and its ancestors, starting from the top-level section.
 * @param {PageName} name Page name.
 * @returns {PageName[]} Page names.
 */
const getAncestry = (name) => {
  const parent = parents[name];

  return parent ? [...getAncestry(parent), name] : [name];
};

/**
 * Get the title used in links to a page, like Hugo’s `LinkTitle`.
 * @param {Page['data']} data Page data.
 * @returns {string} Link title.
 */
export const getLinkTitle = (data) => data.linkTitle ?? data.title;

/**
 * Get the URL path of a fixed page.
 * @param {Locale} locale Locale.
 * @param {PageName} name Page name.
 * @returns {string} Path.
 */
export const getPagePath = (locale, name) =>
  localizePath(locale, name === 'home' ? '/' : `/${getAncestry(name).join('/')}/`);

/**
 * Get the URL path of a news post.
 * @param {Locale} locale Locale.
 * @param {Post} post Post.
 * @returns {string} Path.
 */
export const getPostPath = (locale, post) => `${getPagePath(locale, 'news')}${getSlug(post)}/`;

/**
 * Get the URL path of a tag archive.
 * @param {Locale} locale Locale.
 * @param {string} slug Tag slug.
 * @returns {string} Path.
 */
export const getTagPath = (locale, slug) => `${getPagePath(locale, 'updates')}tag/${slug}/`;

/**
 * Get the URL path of an author archive.
 * @param {Locale} locale Locale.
 * @param {string} slug Author slug.
 * @returns {string} Path.
 */
export const getAuthorPath = (locale, slug) => `${getPagePath(locale, 'updates')}author/${slug}/`;

/**
 * Resolve navigation items with localized page link titles.
 * @param {Locale} locale Locale.
 * @param {NavDefinition[]} items Navigation definitions.
 * @returns {Promise<NavItem[]>} Navigation items.
 */
const resolve = (locale, items) =>
  Promise.all(
    items.map(async ({ page, children = [] }) => {
      const { data } = await getPage(locale, page);

      return {
        id: page,
        label: getLinkTitle(data),
        href: getPagePath(locale, page),
        children: await resolve(locale, children),
      };
    }),
  );

/**
 * Get the pages directly under a fixed page.
 * @param {Locale} locale Locale.
 * @param {PageName} parent Parent page name.
 */
export const getChildPages = (locale, parent) =>
  Promise.all(
    /** @type {PageName[]} */ (Object.keys(parents))
      .filter((name) => parents[name] === parent)
      .map(async (name) => ({
        ...(await getPage(locale, name)).data,
        name,
        href: getPagePath(locale, name),
      })),
  );

/**
 * Get the site navigation menus.
 * @param {Locale} locale Locale.
 * @returns {Promise<{ primary: NavItem[], secondary: NavItem[] }>} Menus.
 */
export const getNavigation = async (locale) => ({
  primary: await resolve(locale, primary),
  secondary: await resolve(locale, secondary),
});

/**
 * Get breadcrumbs for a fixed page and its ancestors, excluding the home page.
 * @param {Locale} locale Locale.
 * @param {PageName} name Page name.
 * @returns {Promise<Crumb[]>} Breadcrumbs.
 */
export const getCrumbs = (locale, name) =>
  Promise.all(
    getAncestry(name).map(async (page) => {
      const { data } = await getPage(locale, page);

      return { label: getLinkTitle(data), href: getPagePath(locale, page) };
    }),
  );

/**
 * Get the layout props of a fixed page.
 * @param {Locale} locale Locale.
 * @param {Exclude<PageName, 'home'>} name Page name.
 */
export const getPageProps = async (locale, name) => {
  const { data } = await getPage(locale, name);
  const [section] = getAncestry(name);

  return {
    locale,
    title: data.title,
    description: data.description,
    image: data.image,
    section,
    page: name === section ? 'index' : name,
    crumbs: await getCrumbs(locale, name),
    contact: {
      description: data.contactDesc,
      link: data.contactLink,
      label: data.contactLabel,
    },
  };
};
