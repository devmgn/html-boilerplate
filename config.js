/**
 * Basic configurations
 */

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
  /** @type { { src: string; dist: string; publicPath: string; javascriptRoot: string; } } */
  paths: {
    src: ConvertPath.toRelative(config.paths.src),
    dist: ConvertPath.toRelative(config.paths.dist),
    publicPath: ConvertPath.toAbsolute(config.paths.publicPath),
    javascriptRoot: ConvertPath.toRelative(config.paths.javascriptRoot),
  },

  /** @type { string } */
  assetModuleFilename: config.assetModuleFilename,

  /** @type { RegExp } */
  assetResourcesRegExp: new RegExp(config.assetResourcesRegExp, 'i'),

  /** @type { string } */
  copyResourcesGlobPattern: config.copyResourcesGlobPattern,
};
