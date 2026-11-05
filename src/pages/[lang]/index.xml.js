import { defaultLocale, getLocaleRoutes, localizePath, useTranslations } from '@i18n/utils';
import { getHeadline, getPage, getPosts, getSettings, getTaxonomy } from '@lib/content';
import { getResizedImageURL } from '@lib/images';
import { getPostPath } from '@lib/navigation';
import { plainify, removeLineBreaks, toISOString } from '@lib/text';

/**
 * @import { APIContext } from 'astro'
 * @import { Locale } from '@i18n/ui'
 */

export const getStaticPaths = () =>
  getLocaleRoutes().map(({ locale, params }) => ({ params, props: { locale } }));

/**
 * Escape special characters for XML.
 * @param {string} text Text.
 * @returns {string} Escaped text.
 */
const escape = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Atom feed of the latest news posts.
 * @param {APIContext<{ locale: Locale }>} context Context.
 * @returns {Promise<Response>} Response.
 */
export const GET = async ({ props, site }) => {
  const { locale } = props;
  const t = useTranslations(locale);
  const { data: updates } = await getPage(locale, 'updates');
  const { publisher } = await getSettings(locale);
  const authors = await getTaxonomy('authors', locale);
  const posts = (await getPosts(locale)).slice(0, 50);
  /** @param {string} path Path. */
  const getURL = (path) => new URL(path, site).href;
  // Atom IDs must never change, so those of the default locale keep the URLs from before the locale
  // prefix was added. Otherwise feed readers would show all the entries as new.
  const getId = (/** @type {string} */ path) =>
    getURL(locale === defaultLocale ? path.replace(localizePath(locale), '/') : path);
  const placeholder = getURL('/images/updates/placeholder.png');

  const entries = posts.map((post) => {
    const path = getPostPath(locale, post);
    const url = getURL(path);
    const image = post.data.image
      ? getURL(getResizedImageURL(post.data.image, '1280x720'))
      : placeholder;
    const html = (post.rendered?.html ?? '')
      .replace(/\n/g, '')
      .replace(/ srcset=".+?"/g, '')
      .replace(/ (src|href)="(\/[^"]*)"/g, (_match, name, value) => ` ${name}="${getURL(value)}"`);

    return [
      '  <entry>',
      `    <id>${getId(path)}</id>`,
      `    <title>${escape(getHeadline(locale, post))}</title>`,
      `    <updated>${toISOString(post.data.date)}</updated>`,
      ...post.data.authors.flatMap((slug) => {
        const author = authors.get(slug);

        return author
          ? ['    <author>', `      <name>${escape(author.name)}</name>`, '    </author>']
          : [];
      }),
      `    <content type="html"><![CDATA[<img loading="lazy" src="${image}" alt="" class="webfeedsFeaturedVisual" />${html.replace(/]]>/g, ']]]]><![CDATA[>')}]]></content>`,
      `    <link rel="alternate" href="${url}"/>`,
      '  </entry>',
    ].join('\n');
  });

  const xml = [
    '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:webfeeds="http://webfeeds.org/rss/1.0">',
    `  <id>${getId(localizePath(locale))}</id>`,
    `  <title>${escape(plainify(removeLineBreaks(updates.title)))}</title>`,
    `  <subtitle>${escape(plainify(updates.description))}</subtitle>`,
    `  <updated>${toISOString(posts[0]?.data.date ?? new Date())}</updated>`,
    '  <author>',
    `    <name>${escape(publisher.name)}</name>`,
    '  </author>',
    `  <link rel="self" href="${getURL(localizePath(locale, '/index.xml'))}"/>`,
    `  <link rel="alternate" href="${getURL(localizePath(locale))}"/>`,
    `  <icon>${getURL('/images/template/favicon.png')}</icon>`,
    `  <logo>${getURL('/images/template/apple-touch-icon.png')}</logo>`,
    `  <webfeeds:icon>${getURL('/images/template/apple-touch-icon.png')}</webfeeds:icon>`,
    `  <webfeeds:cover image="${placeholder}" />`,
    '  <webfeeds:accentColor>A51D3C</webfeeds:accentColor>',
    `  <rights>Copyright © ${new Date().getFullYear()} ${escape(t('site.copyright'))}</rights>`,
    ...entries,
    '</feed>',
  ].join('\n');

  return new Response(xml, { headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' } });
};
