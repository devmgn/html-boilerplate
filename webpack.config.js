/**
 * Webpack configuration
 * @see https://webpack.js.org
 */

/** @typedef { import('webpack').Configuration } WebpackConfiguration */

const glob = require('glob');
const path = require('path');
const sass = require('sass');

// webpack plugins
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const ImageMinimizerWebpackPlugin = require('image-minimizer-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
// @ts-ignore
const PugPlugin = require('pug-plugin');

// configurations
const { paths, assetResourcesRegExp, copyResourcesGlobPattern, assetModuleFilename } = require('./config');

/** @returns { WebpackConfiguration } */
module.exports = () => {
  const entry = () =>
    glob.sync(`**/[^_]*.pug`, { cwd: paths.src }).reduce((entries, src) => {
      const name = path.format({
        dir: path.dirname(src),
        name: path.parse(src).name,
      });

      return { ...entries, ...{ [name]: path.resolve(paths.src, src) } };
    }, {});

  const isProductionBuild = process.env.NODE_ENV === 'production';
  const publicPath = isProductionBuild ? paths.publicPath : '/';
  const sourceMap = !isProductionBuild;

  const assetModuleOption = {
    type: 'asset',
    parser: {
      dataUrlCondition: { maxSize: 1024 / 4 },
    },
  };

  const inlineAssetModuleOption = {
    resourceQuery: /inline/,
    type: 'asset/inline',
  };

  /** @type { WebpackConfiguration } */
  const config = {
    mode: isProductionBuild ? 'production' : 'development',
    entry: entry(),
    output: {
      path: path.resolve(paths.dist),
      filename: `${paths.javascriptRoot}/${assetModuleFilename}.js`,
      publicPath,
      assetModuleFilename: ({ filename }) =>
        filename ? path.join(path.relative(paths.src, path.dirname(filename)), `${assetModuleFilename}[ext]`) : '',
      clean: true,
    },
    module: {
      rules: [
        // JavaScript
        {
          test: /\.[jt]sx?$/i,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: { cacheDirectory: true },
          },
        },
        // Sass
        {
          test: /\.scss$/i,
          use: [
            {
              loader: 'css-loader',
              options: { sourceMap },
            },
            {
              loader: 'postcss-loader',
              options: { sourceMap },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap,
                implementation: sass,
              },
            },
          ],
        },
        // Pug
        {
          test: /\.pug$/i,
          use: [
            {
              loader: PugPlugin.loader,
              options: {
                method: 'render',
              },
            },
          ],
        },
        // Assets
        {
          test: assetResourcesRegExp,
          type: 'asset/resource',
        },
        // Bitmap images
        {
          test: /\.(jpe?g|png|gif)$/i,
          oneOf: [{ ...inlineAssetModuleOption }, { ...assetModuleOption }],
        },
        // svg
        {
          test: /\.svg$/i,
          oneOf: [
            {
              resourceQuery: /include/,
              type: 'asset/source',
            },
            { ...inlineAssetModuleOption },
            { ...assetModuleOption },
          ],
        },
      ],
    },
    resolve: {
      modules: ['...', paths.src],
      extensions: ['...', '.jsx', '.ts', '.tsx'],
      alias: {
        '@': paths.cssRoot,
      },
      plugins: [new TsconfigPathsPlugin()],
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          defaultVendors: {
            chunks: 'initial',
            minChunks: 2,
            name: 'vendor',
            enforce: true,
          },
        },
      },
      minimizer: [
        '...',
        new CssMinimizerWebpackPlugin({
          minimizerOptions: {
            preset: [
              'default',
              {
                calc: false,
                reduceInitial: false,
              },
            ],
          },
        }),
        new ImageMinimizerWebpackPlugin({
          test: /\.(svg|gif)$/i,
          minimizer: {
            implementation: ImageMinimizerWebpackPlugin.imageminMinify,
            options: {
              plugins: [
                'gifsicle',
                [
                  'svgo',
                  {
                    plugins: [
                      {
                        name: 'preset-default',
                        params: {
                          overrides: {
                            removeUnknownsAndDefaults: {
                              keepDataAttrs: false,
                            },
                          },
                        },
                      },
                    ],
                  },
                ],
              ],
            },
          },
        }),
        new ImageMinimizerWebpackPlugin({
          test: /\.(jpe?g|png)$/i,
          minimizer: {
            implementation: ImageMinimizerWebpackPlugin.squooshMinify,
            options: {
              encodeOptions: {
                mozjpeg: {},
                oxipng: {},
              },
            },
          },
          generator: [
            {
              preset: 'webp',
              implementation: ImageMinimizerWebpackPlugin.squooshGenerate,
              options: {
                encodeOptions: {
                  webp: {},
                },
              },
            },
            {
              preset: 'avif',
              implementation: ImageMinimizerWebpackPlugin.squooshGenerate,
              options: {
                encodeOptions: {
                  avif: {},
                },
              },
            },
          ],
        }),
      ],
    },
    plugins: [
      new PugPlugin({
        pretty: true,
        modules: [
          PugPlugin.extractCss({
            filename: `${paths.cssRoot}/${assetModuleFilename}.css`,
          }),
        ],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: copyResourcesGlobPattern,
            to: '[path][name][ext]',
            context: paths.src,
            noErrorOnMissing: true,
          },
        ],
      }),
      new FriendlyErrorsWebpackPlugin(),
    ],
    devtool: !isProductionBuild && 'eval',
    cache: isProductionBuild
      ? false
      : {
          type: 'filesystem',
          buildDependencies: { config: [__filename] },
        },
  };

  return config;
};
