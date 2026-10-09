import { join } from 'path';

import { buildAppConfig } from '../src/config/config.server';
import { commonExports } from './webpack.common';

const CompressionPlugin = require('compression-webpack-plugin');
const zlib = require('zlib');

module.exports = Object.assign({}, commonExports, {
  target: 'web',
  plugins: [
    ...commonExports.plugins,
    new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: /\.(js|css|html|svg|json)$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
    new CompressionPlugin({
      filename: '[path][base].br',
      algorithm: 'brotliCompress',
      test: /\.(js|css|html|svg|json)$/,
      compressionOptions: {
        params: {
          // Quality 10 instead of 11: ~3x faster to compress with files only
          // ~1-2% larger, which noticeably shortens production builds.
          [zlib.constants.BROTLI_PARAM_QUALITY]: 10,
        },
      },
      threshold: 10240,
      minRatio: 0.8,
    }),
  ],
  devServer: {
    setupMiddlewares(middlewares, server) {
      buildAppConfig(join(process.cwd(), 'src/assets/config.json'));
      return middlewares;
    }
  },
  watchOptions: {
    // Ignore directories that should not be watched for recompiling angular
    ignored: [
      '**/node_modules', '**/_build', '**/.git', '**/docker',
      '**/.angular', '**/.idea', '**/.vscode', '**/.history', '**/.vsix'
    ]
  },
});
