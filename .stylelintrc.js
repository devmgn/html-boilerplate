/**
 * Stylelint configuration
 * @see https://stylelint.io
 */

module.exports = {
  extends: ['stylelint-config-recommended-scss', 'stylelint-config-recess-order'],
  plugins: ['stylelint-prettier', 'stylelint-no-unsupported-browser-features'],
  rules: {
    'prettier/prettier': true,
    // Stylistic issues
    'value-keyword-case': [
      'lower',
      {
        camelCaseSvgKeywords: true,
      },
    ],
    'function-name-case': 'lower',
    'selector-type-case': 'lower',
    // Enforce conventions
    'length-zero-no-unit': true,
    'function-url-quotes': 'never',
    'shorthand-property-no-redundant-values': true,
    'declaration-block-no-redundant-longhand-properties': true,
    'selector-not-notation': 'complex',
    'selector-pseudo-element-colon-notation': 'double',
    // stylelint-scss
    'scss/at-mixin-argumentless-call-parentheses': 'never',
    'scss/at-rule-conditional-no-parentheses': true,
    'scss/function-color-relative': true,
    'scss/dollar-variable-default': [true, { ignore: 'local' }],
    'scss/function-no-unknown': true,
    'scss/partial-no-import': true,
    // stylelint-order
    'order/order': [
      'dollar-variables',
      'custom-properties',
      { type: 'at-rule', name: 'include', hasBlock: false },
      'declarations',
      { type: 'at-rule', name: 'include', hasBlock: true },
      'rules',
    ],
    'plugin/no-unsupported-browser-features': [
      true,
      {
        severity: 'warning',
      },
    ],
  },
};
