/**
 * ESLint configuration
 * @see https://eslint.org
 */

module.exports = {
  root: true,
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/strict',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'prettier',
  ],
  settings: {
    'import/resolver': {
      typescript: true,
    },
  },
  rules: {
    'lines-between-class-members': [
      'error',
      'always',
      { exceptAfterSingleLine: true },
    ],
    'no-console': ['warn', { allow: ['error', 'warn'] }],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'TSEnumDeclaration:not([const=true])',
        message: "Don't declare non-const enums",
      },
    ],
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'unknown',
          'parent',
          'sibling',
          'index',
          'object',
          'type',
        ],
        pathGroups: [
          {
            pattern: '@/**',
            group: 'parent',
            position: 'before',
          },
        ],
        'newlines-between': 'never',
        warnOnUnassignedImports: true,
        pathGroupsExcludedImportTypes: ['builtin', 'object', 'type'],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'sort-imports': ['error', { ignoreDeclarationSort: true }],
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports' },
    ],
    '@typescript-eslint/naming-convention': [
      'warn',
      {
        selector: ['interface', 'typeAlias', 'class'],
        format: ['PascalCase'],
      },
      {
        selector: 'variable',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
      },
      {
        selector: 'function',
        format: ['camelCase', 'PascalCase'],
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.ts?(x)'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: true,
      },
    },
  ],
};
