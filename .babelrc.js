/**
 * Babel configuration
 * @see https://babeljs.io
 */

module.exports = (api) => {
  api.cache(true);

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
          useBuiltIns: 'usage',
          corejs: 3,
          debug: !process.env.NODE_ENV,
        },
      ],
      '@babel/preset-typescript',
    ],
  };
};
