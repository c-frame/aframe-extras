const path = require('path');

module.exports = {
  entry: {
    'aframe-extras': './index.js',
    'aframe-extras.controls': './src/controls/index.js',
    'aframe-extras.loaders': './src/loaders/index.js',
    'aframe-extras.misc': './src/misc/index.js',
    'aframe-extras.pathfinding': './src/pathfinding/index.js',
    'aframe-extras.primitives': './src/primitives/index.js',
    'components/sphere-collider': './src/misc/sphere-collider.js',
    'components/grab': './src/misc/grab.js',
  },
  output: {
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    filename:
      process.env.NODE_ENV === 'production'
        ? '[name].min.js'
        : '[name].js'
  },
  externals: {
    // Stubs out `import ... from 'three'` so it returns `import ... from window.THREE` effectively using THREE global variable that is defined by AFRAME.
    three: 'THREE',
  },
  devtool: 'source-map',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devServer: {
    port: process.env.PORT || 8080,
    hot: false,
    liveReload: true,
    watchFiles: ['src/**', 'examples/**'],
    server: {
      type: 'https'
    },
    static: {
      directory: path.resolve(__dirname)
    }
  },
};
