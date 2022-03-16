/**
 * Prettier configuration
 * @see https://prettier.io
 */

module.exports = {
  printWidth: 120,
  overrides: [
    {
      files: '*.[jt]s?(x)',
      options: {
        singleQuote: true,
      },
      singleAttributePerLine: true,
    },
    /**
     * @prettier/plugin-pug
     * @see https://github.com/prettier/plugin-pug
     */
    {
      files: '*.pug',
      options: {
        parser: 'pug',
        pugAttributeSeparator: 'as-needed',
        pugIdNotation: 'as-is',
      },
    },
  ],
};
