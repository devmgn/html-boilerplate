/**
 * Basic configurations
 */

const path = require('path');
// @ts-ignore
// eslint-disable-next-line import/extensions
const { config } = require('./package.json');

const { paths, assetModuleFilename, assetResourcesRegExp, copyResourcesGlobPattern } = config;

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
  /** @type { { src: string; dist: string; publicPath: string; cssRoot: string;javascriptRoot: string; } } */
  paths: {
    src: ConvertPath.toRelative(paths.src),
    dist: ConvertPath.toRelative(paths.dist),
    publicPath: ConvertPath.toAbsolute(paths.publicPath),
    cssRoot: ConvertPath.toRelative(paths.cssRoot),
    javascriptRoot: ConvertPath.toRelative(paths.javascriptRoot),
  },

  /** @type { string } */
  assetModuleFilename,

  /** @type { RegExp } */
  assetResourcesRegExp: new RegExp(assetResourcesRegExp, 'i'),

  /** @type { string } */
  copyResourcesGlobPattern,
};
