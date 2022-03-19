/**
 * Webpack configuration
 * @see https://webpack.js.org
 */

/** @typedef { import('webpack').Configuration } WebpackConfiguration */

const glob = require('glob');
const path = require('path');
const sass = require('sass');

// webpack plugins
const TerserWebpackPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const ImageMinimizerWebpackPlugin = require('image-minimizer-webpack-plugin');
// @ts-ignore
// TODO: fix types
const WebpackRemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');

// configurations
const { paths, assetResourcesRegExp, copyResourcesGlobPattern, assetModuleFilename } = require('./config');

/** @returns { WebpackConfiguration } */
module.exports = () => {
  const entry = () =>
    glob.sync(`**/@(?(*.)bundle.[jt]s?(x)|[^_]*.scss)`, { cwd: paths.src }).reduce((entries, src) => {
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
    entry,
    output: {
      path: path.resolve(paths.dist),
      filename: `${assetModuleFilename}.js`,
      publicPath,
      assetModuleFilename: (pathData) =>
        pathData.filename
          ? path.join(path.relative(paths.src, path.dirname(pathData.filename)), `${assetModuleFilename}[ext]`)
          : '',
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
            MiniCssExtractPlugin.loader,
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
              loader: 'simple-pug-loader',
              options: {
                self: true,
                pretty: true,
                root: path.resolve(paths.src),
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
      modules: ['node_modules', paths.src],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      alias: {
        '@': path.resolve(__dirname, 'src/assets/css'),
      },
      plugins: [new TsconfigPathsPlugin()],
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          defaultVendors: {
            chunks: 'initial',
            minChunks: 2,
            name: path.join(paths.javascriptRoot, 'vendor'),
            enforce: true,
          },
        },
      },
      minimize: isProductionBuild,
      minimizer: [
        new TerserWebpackPlugin({ extractComments: false }),
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
      ...glob.sync('**/[!_]*.pug', { cwd: paths.src }).map(
        (src) =>
          new HtmlWebpackPlugin({
            template: path.join(paths.src, src),
            filename: path.format({
              dir: path.dirname(src),
              name: path.parse(src).name,
              ext: '.html',
            }),
            inject: false,
            minify: {
              // HTMLMinifier
              // @see https://github.com/DanielRuf/html-minifier-terser#options-quick-reference
              removeStyleLinkTypeAttributes: true,
              removeScriptTypeAttributes: true,
              collapseBooleanAttributes: true,
              collapseWhitespace: isProductionBuild,
            },
            publicPath,
            isProductionBuild,
          })
      ),
      new MiniCssExtractPlugin({ filename: `${assetModuleFilename}.css` }),
      new WebpackRemoveEmptyScriptsPlugin({ verbose: !isProductionBuild }),
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
    devtool: !isProductionBuild && 'inline-source-map',
    cache: isProductionBuild
      ? false
      : {
          type: 'filesystem',
          buildDependencies: { config: [__filename] },
          allowCollectingMemory: true,
        },
  };

  return config;
};
