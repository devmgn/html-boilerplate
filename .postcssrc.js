/**
 * Postcss Configuration
 * @see https://postcss.org
 */

const autoprefixer = require('autoprefixer');
const postcssMediaMinMax = require('postcss-media-minmax');
const postcssSortMediaQueries = require('postcss-sort-media-queries');
const postcssFlexbugsFixes = require('postcss-flexbugs-fixes');

module.exports = {
  plugins: [
    postcssMediaMinMax(),
    postcssSortMediaQueries(),
    postcssFlexbugsFixes(),
    autoprefixer(),
  ],
};
