/**
 * @import { Post } from './content'
 */

/**
 * Format a date as an ISO 8601 string without milliseconds.
 * @param {Date} date Date.
 * @returns {string} Date string.
 */
export const toISOString = (date) => date.toISOString().replace(/\.\d{3}Z$/, '+00:00');

/**
 * Remove HTML tags from a string.
 * @param {string} [html] HTML.
 * @returns {string} Text.
 */
export const plainify = (html = '') => html.replace(/<[^>]*>/g, '');

/**
 * Remove line breaks (`<br>`) from a heading.
 * @param {string} [heading] Heading that may contain `<br>`.
 * @returns {string} Heading.
 */
export const removeLineBreaks = (heading = '') => heading.replace(/<br>/g, '');

/**
 * Named HTML entities found in rendered Markdown.
 * @type {Record<string, string>}
 */
const namedEntities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

/**
 * Decode the HTML entities found in rendered Markdown.
 * @param {string} text Text with HTML entities.
 * @returns {string} Text.
 */
const decodeEntities = (text) =>
  text.replace(/&(?:#(\d+)|#x([\da-f]+)|(\w+));/gi, (match, dec, hex, name) => {
    if (dec || hex) {
      const codePoint = Number.parseInt(dec ?? hex, dec ? 10 : 16);

      return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : '�';
    }

    return namedEntities[name] ?? match;
  });

/**
 * Count words in text, where each CJK character counts as a word.
 * @param {string} text Text.
 * @returns {number} Word count.
 */
const countWords = (text) =>
  text.match(
    /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]|[^\s\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]+/gu,
  )?.length ?? 0;

/**
 * Get a post summary as plain text: the `summary` field, or the first paragraphs of the body up to
 * 70 words, like Hugo’s automatic summary.
 * @param {Pick<Post, 'rendered'> & { data: Pick<Post['data'], 'summary'> }} post Post.
 * @returns {string} Summary.
 */
export const getSummary = (post) => {
  if (post.data.summary) {
    return plainify(post.data.summary).trim();
  }

  const paragraphs = decodeEntities(
    plainify(
      (post.rendered?.html ?? '')
        .replace(/<\/(?:p|h\d|li|figure|figcaption|div|blockquote|tr)>/g, '\n\n')
        .replace(/<br\s*\/?>/g, ' '),
    ),
  )
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  let summary = '';

  for (const paragraph of paragraphs) {
    summary = summary ? `${summary} ${paragraph}` : paragraph;

    if (countWords(summary) >= 70) {
      break;
    }
  }

  return summary;
};

/**
 * Truncate text to the given length without cutting words, like Hugo’s `truncate` function. The
 * text is cut before the last whitespace or after the last CJK character within the limit.
 * @param {string} text Text.
 * @param {number} length Maximum number of characters.
 * @param {(truncated: string) => string} [format] Function to mark text as truncated.
 * @returns {string} Truncated text.
 */
export const truncate = (text, length, format = (truncated) => `${truncated}...`) => {
  const chars = [...text];

  if (chars.length <= length) {
    return text;
  }

  let lastWordIndex = 0;

  chars.slice(0, length + 1).forEach((char, index) => {
    if (/\s/.test(char)) {
      lastWordIndex = index;
    } else if (
      index < length &&
      /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(char)
    ) {
      lastWordIndex = index + 1;
    }
  });

  return format(
    chars
      .slice(0, lastWordIndex || length)
      .join('')
      .trimEnd(),
  );
};
