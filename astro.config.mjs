// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

import sitemap from '@astrojs/sitemap';

const { SITE_URL } = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');

// https://astro.build/config
export default defineConfig({
  // Used for canonical URLs, absolute Open Graph image URLs and the sitemap.
  site: SITE_URL || 'https://example.com',

  output: 'static',

  build: {
    // Keeps /about-us rather than /about-us/, matching the template's links.
    format: 'file',
    // The theme's stylesheets are order-sensitive: keep them as one external file.
    inlineStylesheets: 'never',
  },

  trailingSlash: 'never',
  integrations: [
    sitemap({
      // Sign-in and password screens are demo pages, not content.
      filter: (page) => !/\/(401|404|user-authentication\/)/.test(page),
    }),
  ],
});
