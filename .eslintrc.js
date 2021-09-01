/**
 * ESLint configuration
 * @see https://eslint.org
 */

const { directory } = require('./config');

module.exports = {
  root: true,
  env: {
    es2021: true,
    browser: true,
  },
  extends: ['airbnb-base', 'prettier'],
  rules: {
    'no-console': [
      'error',
      {
        allow: ['error', 'warn'],
      },
    ],
    'lines-between-class-members': [
      'error',
      'always',
      {
        exceptAfterSingleLine: true,
      },
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        json: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.ts?(x)'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      parserOptions: {
        project: 'tsconfig.json',
      },
      settings: {
        'import/resolver': {
          typescript: {
            project: './',
          },
        },
      },
    },
  ],
};
