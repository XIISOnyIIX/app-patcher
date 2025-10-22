module.exports = {
  '*.{ts,tsx,js,jsx}': ['npx eslint --max-warnings=0 --fix'],
  '*.{json,md,css,html}': ['npx prettier --write']
};
