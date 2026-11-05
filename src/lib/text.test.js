import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getSummary, plainify, removeLineBreaks, toISOString, truncate } from './text.js';

/**
 * Create a post with the given fields.
 * @param {{ html?: string, summary?: string }} fields Fields.
 * @returns {Parameters<typeof getSummary>[0]} Post.
 */
const createPost = ({ html = '', summary }) => ({
  data: { summary },
  rendered: { html },
});

describe('toISOString', () => {
  it('omits milliseconds', () => {
    assert.equal(toISOString(new Date('2026-10-15T06:56:56.385Z')), '2026-10-15T06:56:56+00:00');
  });
});

describe('plainify', () => {
  it('removes tags', () => {
    assert.equal(plainify('<p>a <strong>b</strong></p>'), 'a b');
  });

  it('accepts undefined', () => {
    assert.equal(plainify(), '');
  });
});

describe('removeLineBreaks', () => {
  it('removes `<br>`', () => {
    assert.equal(removeLineBreaks('ディノの<br>足あと'), 'ディノの足あと');
  });
});

describe('getSummary', () => {
  it('prefers the `summary` field', () => {
    assert.equal(getSummary(createPost({ html: '<p>Body</p>', summary: ' <b>Hi</b> ' })), 'Hi');
  });

  it('stops after the paragraph reaching 70 words', () => {
    const first = 'あ'.repeat(70);

    assert.equal(getSummary(createPost({ html: `<p>${first}</p><p>次</p>` })), first);
  });

  it('continues to the next paragraph below 70 words', () => {
    assert.equal(getSummary(createPost({ html: '<p>一</p><p>二</p>' })), '一 二');
  });

  it('counts a Latin word as one word', () => {
    const first = 'word '.repeat(69).trim();

    assert.equal(getSummary(createPost({ html: `<p>${first}</p><p>end</p>` })), `${first} end`);
  });

  it('decodes HTML entities', () => {
    assert.equal(getSummary(createPost({ html: '<p>R&amp;D &#x3C;1&#62;</p>' })), 'R&D <1>');
  });

  it('replaces an out-of-range numeric entity', () => {
    assert.equal(getSummary(createPost({ html: '<p>&#9999999;</p>' })), '�');
  });

  it('separates lines around `<br>`', () => {
    assert.equal(getSummary(createPost({ html: '<p>a<br>b</p>' })), 'a b');
  });
});

describe('truncate', () => {
  it('keeps text within the limit', () => {
    assert.equal(truncate('あいう', 3), 'あいう');
  });

  it('cuts CJK text at the limit', () => {
    assert.equal(truncate('あいうえお', 3), 'あいう...');
  });

  it('keeps a Latin word that ends at the limit', () => {
    assert.equal(truncate('あ EXPO い', 6), 'あ EXPO...');
  });

  it('drops a Latin word that crosses the limit', () => {
    assert.equal(truncate('あ (OSC2026 Shimane)', 12), 'あ (OSC2026...');
  });

  it('cuts text without word boundaries at the limit', () => {
    assert.equal(truncate('abcdef', 3), 'abc...');
  });

  it('uses the given format', () => {
    assert.equal(
      truncate('あいう', 1, (text) => `${text}…`),
      'あ…',
    );
  });
});
