import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  srcDir: 'src',
  server: {
    port: 4321
  }
});
