import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

import expressiveCode from 'astro-expressive-code';

export default defineConfig({
  integrations: [tailwind(), expressiveCode()],
  srcDir: 'src',
  server: {
    port: 4321
  }
});