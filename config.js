/**
 * Basic configurations
 */

/** @typedef { { src: string; dist: string; javascriptRoot: string; publicPath: string; } } Directory */

const path = require('path');
// @ts-ignore
// eslint-disable-next-line import/extensions
const { config } = require('./package.json');

/**
 * Convert path to absolute or relative path
 */
class ConvertPath {
  /**
   * @param { string } targetPath
   * @returns { string }
   */
  static toRelative(targetPath) {
    const normalizedPath = path.normalize(targetPath);
    return path.isAbsolute(normalizedPath)
      ? normalizedPath.replace(path.parse(normalizedPath).root, '')
      : normalizedPath;
  }

  /**
   * @param { string } targetPath
   * @returns { string }
   */
  static toAbsolute(targetPath) {
    const normalizedPath = `${path.normalize(targetPath).replace(new RegExp(`${path.sep}$`), '')}${path.sep}`;
    return path.isAbsolute(normalizedPath) ? normalizedPath : path.join(path.sep, normalizedPath);
  }
}

module.exports = {
  /** @type { Directory } */
  directory: {
    src: ConvertPath.toRelative(config.directory.src),
    dist: ConvertPath.toRelative(config.directory.dist),
    javascriptRoot: ConvertPath.toRelative(config.directory.javascriptRoot),
    publicPath: ConvertPath.toAbsolute(config.directory.publicPath),
  },

  /** @type { RegExp } */
  assetResourcesRegExp: new RegExp(config.assetResourcesRegExp, 'i'),

  /** @type { string } */
  copyResourcesGlobPattern: config.copyResourcesGlobPattern,

  /** @type { string } */
  assetModuleFilename: config.assetModuleFilename,
};
