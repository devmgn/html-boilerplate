/**
 * Stylelint configuration
 * @see https://stylelint.io
 */

module.exports = {
  extends: ['stylelint-config-recommended-scss', 'stylelint-prettier/recommended', 'stylelint-config-rational-order'],
  rules: {
    // Stylistic issues
    'value-keyword-case': 'lower',
    'function-name-case': 'lower',
    'selector-type-case': 'lower',
    // Enforce conventions
    'length-zero-no-unit': true,
    'function-url-quotes': 'never',
    'shorthand-property-no-redundant-values': true,
    'declaration-block-no-redundant-longhand-properties': true,
    'selector-not-notation': 'complex',
    'selector-pseudo-element-colon-notation': 'double',
    // Handled by pretty printers
    'string-quotes': 'double',
    // stylelint-scss
    'scss/at-mixin-argumentless-call-parentheses': 'never',
    'scss/at-rule-conditional-no-parentheses': true,
    'scss/dimension-no-non-numeric-values': true,
    'scss/no-duplicate-mixins': true,
    'scss/no-global-function-names': true,
    // stylelint-order
    'order/order': [
      'dollar-variables',
      'custom-properties',
      { type: 'at-rule', name: 'include', hasBlock: false },
      'declarations',
      { type: 'at-rule', name: 'include', hasBlock: true },
      'rules',
    ],
  },
};
