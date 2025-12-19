const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const astroPlugin = require("eslint-plugin-astro");

module.exports = [
  {
    ignores: ["dist/**", "node_modules/**", "**/.astro/**", "eslint.config.js"],
  },
  // Astro (.astro + règles recommandées) – version Flat Config (ESLint 9)
  ...astroPlugin.configs["flat/recommended"],
  {
    files: ["**/*.{ts,cts,mts}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: false },
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
    },
  },
];
