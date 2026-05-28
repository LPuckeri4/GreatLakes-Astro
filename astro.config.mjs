// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  redirects: {
    '/surgery': '/surgery/dental-implants',
    '/after-surgery': '/after-surgery/general-instructions',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
