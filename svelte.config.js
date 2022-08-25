import adapter from '@sveltejs/adapter-netlify';

const config = {
  kit: {
    adapter: adapter({
      edge: true,
    }),
    files: {
      assets: 'public'
    },
    outDir: 'build'
  },
};

export default config;
