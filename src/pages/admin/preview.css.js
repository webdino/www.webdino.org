import baseStyles from '@styles/base.css?raw';

/**
 * Stylesheet for the CMS entry preview, registered in `public/admin/index.html`. The site styles
 * are bundled by Astro under hashed file names, so the base styles are served at a fixed URL here.
 * @returns {Response} Response.
 */
export const GET = () =>
  new Response(`${baseStyles}\nbody {\n  padding: 16px;\n}\n`, {
    headers: { 'Content-Type': 'text/css; charset=utf-8' },
  });
