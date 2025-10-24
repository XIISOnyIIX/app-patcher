module.exports = {
  root: true,
  env: {
    es2021: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier'
  ],
  settings: {
    'import/resolver': {
      typescript: true
    },
    react: {
      version: 'detect'
    }
  },
  rules: {
    'import/order': [
      'error',
      {
        groups: [['builtin', 'external'], ['internal'], ['parent', 'sibling', 'index']],
        alphabetize: { order: 'asc', caseInsensitive: true },
        'newlines-between': 'always'
      }
    ],
    'import/no-unresolved': 'off',
    'import/default': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'no-console': 'off'
  },
  overrides: [
    {
      files: ['packages/backend/**/*.ts'],
      env: {
        node: true
      },
      parserOptions: {
        project: ['./packages/backend/tsconfig.json'],
        tsconfigRootDir: __dirname
      },
      rules: {}
    },
    {
      files: ['packages/frontend/**/*.{ts,tsx}'],
      env: {
        browser: true
      },
      parserOptions: {
        project: ['./packages/frontend/tsconfig.json'],
        tsconfigRootDir: __dirname,
        ecmaFeatures: {
          jsx: true
        }
      },
      plugins: ['react', 'react-hooks', '@typescript-eslint', 'import'],
      extends: [
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended'
      ],
      rules: {
        'react/prop-types': 'off'
      }
    },
    {
      files: ['packages/frontend/vite.config.ts', 'packages/frontend/vitest.config.ts'],
      env: {
        node: true
      },
      parserOptions: {
        project: ['./packages/frontend/tsconfig.node.json'],
        tsconfigRootDir: __dirname,
        sourceType: 'module'
      }
    },
    {
      files: ['**/*.config.js', '**/*.config.cjs'],
      env: {
        node: true
      },
      parserOptions: {
        sourceType: 'script'
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ]
};
