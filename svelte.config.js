import adapter from '@sveltejs/adapter-netlify';

const config = {
  kit: {
    adapter: adapter({
      edge: true,
      fallback: '/error/index.html',
      precompress: false,
    }),
    files: {
      assets: 'public'
    },
  },
};

export default config;
