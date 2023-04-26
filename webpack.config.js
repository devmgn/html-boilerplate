/**
 * Webpack configuration
 * @see https://webpack.js.org
 */

/** @typedef { import('webpack').Configuration } WebpackConfiguration */

const path = require('path');
// webpack plugins
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const glob = require('glob');
const ImageMinimizerWebpackPlugin = require('image-minimizer-webpack-plugin');
// @ts-ignore
const PugPlugin = require('pug-plugin');
const sass = require('sass');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
// configurations
const {
  paths,
  assetResourcesRegExp,
  copyResourcesGlobPattern,
  assetModuleFilename,
} = require('./config');

/** @returns { WebpackConfiguration } */
module.exports = () => {
  const entry = () =>
    glob.sync(`**/[^_]*.pug`, { cwd: paths.src }).reduce((entries, src) => {
      const name = path.format({
        dir: path.dirname(src),
        name: path.parse(src).name,
      });

      return { ...entries, [name]: path.resolve(paths.src, src) };
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
      filename: path.join(paths.javascriptRoot, `${assetModuleFilename}.js`),
      publicPath,
      assetModuleFilename: ({ filename }) =>
        path.join(
          path.relative(paths.src, path.dirname(filename || '')),
          `${assetModuleFilename}[ext]`
        ),
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
            // Not Supported pug-plugin
            // {
            //   resourceQuery: /include/,
            //   type: 'asset/source',
            // },
            { ...inlineAssetModuleOption },
            { ...assetModuleOption },
          ],
        },
      ],
    },
    resolve: {
      modules: ['...', paths.src],
      extensions: ['...', '.jsx', '.ts', '.tsx'],
      plugins: [new TsconfigPathsPlugin({ extensions: ['.ts', '.tsx', '.scss'] })],
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          defaultVendors: {
            test: /\.[jt]sx?$/i,
            chunks: 'initial',
            minChunks: 2,
            name: 'vendors',
            enforce: true,
          },
        },
      },
      minimizer: [
        '...',
        new CssMinimizerWebpackPlugin({
          minify: CssMinimizerWebpackPlugin.lightningCssMinify,
        }),
        new ImageMinimizerWebpackPlugin({
          test: /\.(svg)$/i,
          minimizer: {
            implementation: ImageMinimizerWebpackPlugin.imageminMinify,
            options: {
              plugins: [
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
          // @see https://sharp.pixelplumbing.com/api-output
          test: /\.(jpe?g|png|gif)$/i,
          minimizer: {
            implementation: ImageMinimizerWebpackPlugin.sharpMinify,
          },
          generator: [
            {
              preset: 'webp',
              implementation: ImageMinimizerWebpackPlugin.sharpGenerate,
            },
            {
              preset: 'avif',
              implementation: ImageMinimizerWebpackPlugin.sharpGenerate,
            },
          ],
        }),
      ],
    },
    plugins: [
      new PugPlugin({
        pretty: true,
        extractComments: true,
        verbose: !isProductionBuild,
        css: {
          filename: path.join(paths.cssRoot, `${assetModuleFilename}.css`),
        },
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
  };

  return config;
};
