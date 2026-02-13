// @ts-check

import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  experimental: {
    svgo: true,
  },
  image: {
    responsiveStyles: true,
  },
  integrations: [sitemap(), icon()],
  prefetch: true,
  site: 'https://astro-animations.netlify.app/',
});
