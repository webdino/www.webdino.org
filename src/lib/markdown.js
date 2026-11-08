import { defineHastPlugin, markdownToHtml } from 'satteri';
import { BODY_IMAGE_SIZES, getResponsiveImage } from './images.js';

/**
 * Sätteri plugin that serves resized copies of local images in Markdown content.
 */
export const responsiveImages = () =>
  defineHastPlugin({
    name: 'responsive-images',
    element: {
      filter: ['img'],
      visit(node, ctx) {
        const { src: original } = node.properties;

        if (typeof original !== 'string') {
          return;
        }

        const { src, srcset } = getResponsiveImage(original, BODY_IMAGE_SIZES);

        ctx.setProperty(node, 'loading', 'lazy');

        if (srcset) {
          ctx.setProperty(node, 'src', src);
          ctx.setProperty(node, 'srcSet', srcset);
        }
      },
    },
  });

/**
 * Render a Markdown string in front matter, like Hugo’s `markdownify` function: a single
 * paragraph is returned without the `<p>` wrapper.
 * @param {string | undefined} source Markdown source.
 * @returns {string} HTML.
 */
export const markdownify = (source) => {
  if (!source) {
    return '';
  }

  const { html } = markdownToHtml(source, { features: { smartPunctuation: true } });
  const trimmed = html.trim();
  const match = trimmed.match(/^<p>([\s\S]*)<\/p>$/);

  return match && !match[1].includes('<p>') ? match[1] : trimmed;
};
