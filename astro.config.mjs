// @ts-check
import { satteri } from '@astrojs/markdown-satteri';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { copyFile } from 'node:fs/promises';
import { responsiveImages } from './src/lib/markdown.js';

/**
 * Mimic the production routes in local development: serve the CMS admin page at `/admin/`, and
 * redirect the root to the default locale like Cloudflare Pages does with `public/_redirects`.
 * @returns {import('astro').AstroIntegration} Integration.
 */
const devRoutes = () => {
  let defaultLocale = '';

  return {
    name: 'dev-routes',
    hooks: {
      'astro:config:done': ({ config }) => {
        defaultLocale = config.i18n?.defaultLocale ?? '';
      },
      'astro:server:setup': ({ server }) => {
        server.middlewares.use((req, res, next) => {
          if (req.url && /^\/admin\/?(\?.*)?$/.test(req.url)) {
            req.url = '/admin/index.html';
          }

          if (defaultLocale && req.url && /^\/(\?.*)?$/.test(req.url)) {
            res.writeHead(302, { Location: `/${defaultLocale}/` }).end();

            return;
          }

          next();
        });
      },
    },
  };
};

/**
 * Copy each locale’s error page to `404.html`, which Cloudflare Pages serves for missing files in
 * the same directory or below. The root `404.html` uses the default locale and also stops Pages
 * from treating the site as a single-page application.
 * @returns {import('astro').AstroIntegration} Integration.
 */
const notFoundPages = () => {
  /** @type {import('astro').AstroConfig['i18n']} */
  let i18n;

  return {
    name: 'not-found-pages',
    hooks: {
      'astro:config:done': ({ config }) => {
        i18n = config.i18n;
      },
      'astro:build:done': async ({ dir }) => {
        if (!i18n) {
          return;
        }

        const locales = i18n.locales.map((locale) =>
          typeof locale === 'string' ? locale : locale.path,
        );

        await Promise.all([
          ...locales.map((locale) =>
            copyFile(
              new URL(`${locale}/error/index.html`, dir),
              new URL(`${locale}/404.html`, dir),
            ),
          ),
          copyFile(
            new URL(`${i18n.defaultLocale}/error/index.html`, dir),
            new URL('404.html', dir),
          ),
        ]);
      },
    },
  };
};

// https://astro.build/config
export default defineConfig({
  site: 'https://www.webdino.org',
  i18n: {
    locales: ['ja'],
    defaultLocale: 'ja',
    routing: {
      // Every locale, including the default, has a URL prefix like `/ja/`. The root `/` is
      // redirected by Cloudflare Pages (`public/_redirects`) rather than by a generated page.
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  markdown: {
    processor: satteri({
      // Parse raw HTML (figures, embeds) so image URLs in post bodies can be rewritten
      features: {
        rawHtml: true,
        // Japanese is the only locale for now; the label is visually hidden
        gfm: { footnotes: { label: '脚注', backLabel: '参照 {reference} に戻る' } },
      },
      hastPlugins: [responsiveImages()],
    }),
  },
  vite: {
    build: {
      // Serve scripts as files. When navigating to a page with a new inline module script, the view
      // transition router waits for it with a `data:` script, which the CSP in `_headers` blocks
      assetsInlineLimit: 0,
    },
  },
  integrations: [
    sitemap({
      filter: (page) => !/\/(admin|error)\/$/.test(page),
    }),
    devRoutes(),
    notFoundPages(),
  ],
});
