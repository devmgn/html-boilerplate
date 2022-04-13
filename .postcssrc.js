/**
 * Postcss Configuration
 * @see https://postcss.org
 */

const autoprefixer = require('autoprefixer');
const postcssSortMediaQueries = require('postcss-sort-media-queries');
const postcssFlexbugsFixes = require('postcss-flexbugs-fixes');

module.exports = {
  plugins: [postcssSortMediaQueries(), postcssFlexbugsFixes(), autoprefixer()],
};
