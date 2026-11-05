import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getOriginalImagePath, getResizedImageURL, getResponsiveImage } from './images.js';

describe('getResizedImageURL', () => {
  it('keeps JPEG and WebP images in their format', () => {
    assert.equal(getResizedImageURL('/uploads/a.jpg', '640x360'), '/resized/640x360/uploads/a.jpg');
    assert.equal(getResizedImageURL('/images/a.webp', '640x360'), '/resized/640x360/images/a.webp');
  });

  it('converts PNG images to WebP', () => {
    assert.equal(
      getResizedImageURL('/uploads/a.png', '640x360'),
      '/resized/640x360/uploads/a.png.webp',
    );
  });

  it('returns other paths as they are', () => {
    assert.equal(getResizedImageURL('/uploads/a.gif', '640x360'), '/uploads/a.gif');
    assert.equal(
      getResizedImageURL('https://example.com/a.png', '640x360'),
      'https://example.com/a.png',
    );
  });
});

describe('getOriginalImagePath', () => {
  it('restores PNG images', () => {
    assert.equal(getOriginalImagePath('uploads/a.png.webp'), 'uploads/a.png');
  });

  it('keeps other images', () => {
    assert.equal(getOriginalImagePath('uploads/a.webp'), 'uploads/a.webp');
    assert.equal(getOriginalImagePath('uploads/a.jpg'), 'uploads/a.jpg');
  });
});

describe('getResponsiveImage', () => {
  it('returns 1x and 2x images', () => {
    assert.deepEqual(getResponsiveImage('/uploads/a.png', ['640x360', '1280x720']), {
      src: '/resized/640x360/uploads/a.png.webp',
      srcset: '/resized/640x360/uploads/a.png.webp, /resized/1280x720/uploads/a.png.webp 2x',
    });
  });

  it('omits `srcset` for images that cannot be resized', () => {
    assert.deepEqual(getResponsiveImage('/uploads/a.gif', ['640x360', '1280x720']), {
      src: '/uploads/a.gif',
      srcset: undefined,
    });
  });
});
