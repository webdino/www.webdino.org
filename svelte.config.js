import adapter from '@sveltejs/adapter-netlify';

const config = {
  kit: {
    adapter: adapter({
      edge: true,
      fallback: '/error/index.html',
      precompress: false,
    }),
    prerender: {
      default: true,
    },
    files: {
      assets: 'public'
    },
  },
};

export default config;
