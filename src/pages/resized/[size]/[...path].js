import { cacheDir, publicDir } from 'astro:config/server';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { getPages, getPosts } from '@lib/content';
import {
  FEATURED_IMAGE_SIZES,
  getOriginalImagePath,
  getResizedImageURL,
  RESIZABLE_IMAGE_REGEX,
  SUMMARY_IMAGE_SIZES,
} from '@lib/images';
import { locales } from '@i18n/utils';

/**
 * @import { APIContext } from 'astro'
 */

/**
 * Generate resized copies of all the images used in published news posts and fixed pages: featured
 * images and the images in Markdown bodies.
 */
export const getStaticPaths = async () => {
  /** @type {Set<string>} */
  const urls = new Set();

  for (const locale of locales) {
    const posts = await getPosts(locale);

    for (const post of posts) {
      const { image } = post.data;

      if (image && RESIZABLE_IMAGE_REGEX.test(image)) {
        new Set([...SUMMARY_IMAGE_SIZES, ...FEATURED_IMAGE_SIZES]).forEach((size) => {
          urls.add(getResizedImageURL(image, size));
        });
      }
    }

    // Images in Markdown bodies have been rewritten by the `responsiveImages` Markdown plugin
    for (const entry of [...posts, ...(await getPages(locale))]) {
      for (const [url] of entry.rendered?.html.matchAll(/\/resized\/[^\s",]+/g) ?? []) {
        urls.add(url);
      }
    }
  }

  return [...urls].map((url) => {
    const [, size, path] = /** @type {RegExpMatchArray} */ (
      url.match(/^\/resized\/(\d+x\d+)\/(.+)$/)
    );

    let decodedPath = path;

    try {
      decodedPath = decodeURI(path);
    } catch {
      // Keep a file name with a literal `%` as is
    }

    return { params: { size, path: decodedPath } };
  });
};

const formats = /** @type {const} */ ({ jpg: 'jpeg', jpeg: 'jpeg', webp: 'webp' });

/**
 * Version of the image processing below. Bump it when changing the processing options so cached
 * images are regenerated.
 */
const CACHE_VERSION = 3;

/**
 * Encode each path segment so characters like `#` and `?` in file names aren’t parsed as URL parts.
 * @param {string} path Path.
 * @returns {string} Encoded path.
 */
const encodePath = (path) => path.split('/').map(encodeURIComponent).join('/');

/**
 * Scale down an image to fit the given box, like Hugo’s `Fit` image method.
 * @param {APIContext} context Context.
 * @returns {Promise<Response>} Response.
 */
export const GET = async ({ params }) => {
  const { size = '', path = '' } = params;
  const [width, height] = size.split('x').map(Number);
  const extension = /** @type {keyof typeof formats} */ (path.split('.').pop()?.toLowerCase());
  const format = formats[extension];

  if (!format) {
    // The Markdown plugin’s URLs are stored in Astro’s content cache, which ignores plugin changes
    throw new Error(`Unsupported image: ${path}. Clear the cache with \`astro sync --force\`.`);
  }

  const source = new URL(encodePath(getOriginalImagePath(path)), publicDir);
  const cache = new URL(`resized/v${CACHE_VERSION}/${size}/${encodePath(path)}`, cacheDir);

  // Reuse the image resized in a previous build unless the original has been updated since
  const cached = await stat(cache).catch(() => undefined);

  if (cached && cached.mtimeMs >= (await stat(source)).mtimeMs) {
    return new Response(new Uint8Array(await readFile(cache)), {
      headers: { 'Content-Type': `image/${format}` },
    });
  }

  const output = await sharp(await readFile(source))
    .rotate()
    .resize(width, height, { fit: 'inside', withoutEnlargement: true })
    .toFormat(format, { quality: 75 })
    .toBuffer();

  await mkdir(new URL('.', cache), { recursive: true });
  await writeFile(cache, output);

  return new Response(new Uint8Array(output), { headers: { 'Content-Type': `image/${format}` } });
};
