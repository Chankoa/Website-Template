/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte}'
  ],
  theme: {
    extend: {
      colors: {
        accent: '#ff4d00',
        bg: '#fdfcf7',
        text: '#1a1a1a'
      },
      borderRadius: {
        md: '0.75rem'
      }
    }
  },
  plugins: []
};
