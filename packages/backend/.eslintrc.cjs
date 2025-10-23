module.exports = {
  extends: ['../../.eslintrc.cjs'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['src/generated/**/*', 'dist/**/*', '*.config.js', '*.config.ts', 'prisma/**/*'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
