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

// configurations
const { directory, alias, assetResourcesRegExp, copyResourcesGlobPattern, assetModuleFilename } = require('./config');

/** @returns { WebpackConfiguration } */
module.exports = () => {
  const entry = () =>
    glob.sync(`**/@(?(*.)bundle.[jt]s?(x)|[^_]*.scss)`, { cwd: directory.src }).reduce((entries, src) => {
      const name = path.format({
        dir: path.dirname(src),
        name: path.parse(src).name,
      });

      return { ...entries, ...{ [name]: path.resolve(directory.src, src) } };
    }, {});

  const isProductionBuild = process.env.NODE_ENV === 'production';
  const publicPath = isProductionBuild ? directory.publicPath : '/';
  const sourceMap = !isProductionBuild;

  const assetModuleOptions = {
    type: 'asset',
    parser: {
      dataUrlCondition: { maxSize: 1024 / 4 },
    },
  };

  const imageMinimizerWebpackPlugin = new ImageMinimizerWebpackPlugin({
    minimizerOptions: {
      plugins: [
        ['mozjpeg', { quality: 65 }],
        'gifsicle',
        'pngquant',
        [
          'svgo',
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeAttrs: {
                  params: { attrs: ['data.*'] },
                },
              },
            },
          },
        ],
      ],
    },
  });

  /** @type { WebpackConfiguration } */
  const config = {
    mode: isProductionBuild ? 'production' : 'development',
    entry,
    output: {
      path: path.resolve(directory.dist),
      filename: `${assetModuleFilename}.js`,
      publicPath,
      assetModuleFilename: (pathData) =>
        pathData.filename
          ? path.join(path.relative(directory.src, path.dirname(pathData.filename)), `${assetModuleFilename}[ext]`)
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
                root: path.resolve(directory.src),
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
          ...assetModuleOptions,
        },
        // svg
        {
          test: /\.svg$/i,
          oneOf: [
            // inline svg
            {
              resourceQuery: /inline/,
              type: 'asset/source',
            },
            // default
            { ...assetModuleOptions },
          ],
        },
      ],
    },
    resolve: {
      alias,
      modules: ['node_modules', directory.src],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          defaultVendors: {
            chunks: 'initial',
            minChunks: 2,
            name: path.join(directory.javascriptRoot, 'vendor'),
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
      ],
    },
    plugins: [
      ...glob.sync('**/[!_]*.pug', { cwd: directory.src }).map(
        (src) =>
          new HtmlWebpackPlugin({
            template: path.join(directory.src, src),
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
            context: directory.src,
            noErrorOnMissing: true,
          },
        ],
      }),
      new FriendlyErrorsWebpackPlugin(),
    ],
    devtool: !isProductionBuild && 'inline-source-map',
    cache: {
      type: 'filesystem',
      buildDependencies: { config: [__filename] },
    },
  };

  if (isProductionBuild && config.plugins) {
    config.plugins.push(imageMinimizerWebpackPlugin);
  }

  return config;
};
