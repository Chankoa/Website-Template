import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

const SITE = process.env.SITE ?? process.env.BASE_URL ?? 'https://example.com/www';
const siteUrl = new URL(SITE);
const basePath = siteUrl.pathname === '/' ? '/www' : siteUrl.pathname.replace(/\/$/, '');

export default defineConfig({
  site: siteUrl.origin + siteUrl.pathname,
  base: basePath,
  integrations: [tailwind()],
  srcDir: 'src',
  server: {
    port: 4321
  }
});
