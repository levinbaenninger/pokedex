/**
 * @type {import('lint-staged').Configuration}
 */
const config = {
  '*.{ts,js,json,css,scss,html,md,yml,yaml}': ['prettier --write'],
  '*.{ts,js,mjs,cjs}': ['eslint --fix'],
};

export default config;
