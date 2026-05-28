// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  redirects: {
    '/surgery': '/surgery/dental-implants',
    '/after-surgery': '/after-surgery/general-instructions',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
