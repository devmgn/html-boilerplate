/**
 * Basic configurations
 */

/** @typedef { { src: string; dist: string; publicPath: string; javascriptRoot: string; } } Directory */

const path = require('path');
// @ts-ignore
// eslint-disable-next-line import/extensions
const { config } = require('./package.json');

/**
 * Convert path to absolute or relative path
 */
class ConvertPath {
  /** @param { string } targetPath, @returns { string } */
  static normalize(targetPath) {
    return path.normalize(path.join(targetPath, '/'));
  }

  /** @param { string } targetPath, @returns { string } */
  static toRelative(targetPath) {
    const normalizedPath = ConvertPath.normalize(targetPath);
    return path.isAbsolute(normalizedPath) ? normalizedPath.replace('/', '') : normalizedPath;
  }

  /** @param { string } targetPath, @returns { string } */
  static toAbsolute(targetPath) {
    const normalizedPath = ConvertPath.normalize(targetPath);
    return path.isAbsolute(normalizedPath) ? normalizedPath : path.join('/', normalizedPath);
  }
}

module.exports = {
  /** @type { Directory } */
  directory: {
    src: ConvertPath.toRelative(config.directory.src),
    dist: ConvertPath.toRelative(config.directory.dist),
    publicPath: ConvertPath.toAbsolute(config.directory.publicPath),
    javascriptRoot: ConvertPath.toRelative(config.directory.javascriptRoot),
  },

  /** @type { { [key: string]: string[] } } */
  alias: Object.keys(config.alias).reduce((aliases, key) => {
    const resolvedPaths = config.alias[key].map((/** @type {string} */ alias) => ConvertPath.toRelative(alias));
    return { ...aliases, ...{ [key]: resolvedPaths } };
  }, {}),

  /** @type { string } */
  assetModuleFilename: config.assetModuleFilename,

  /** @type { RegExp } */
  assetResourcesRegExp: new RegExp(config.assetResourcesRegExp, 'i'),

  /** @type { string } */
  copyResourcesGlobPattern: config.copyResourcesGlobPattern,
};
