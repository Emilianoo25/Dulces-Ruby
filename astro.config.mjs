import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://dulces-ruby.vercel.app',
  integrations: [
    preact(),
    // El panel es privado: fuera del sitemap
    sitemap({ filter: (page) => !page.includes('/panel') }),
  ],
});
