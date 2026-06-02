// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.greatlakessurgerycentre.com',
  output: 'static',
  integrations: [
    sitemap(),
  ],
  redirects: {
    '/surgery': '/surgery/dental-implants',
    '/after-surgery': '/after-surgery/general-instructions',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
