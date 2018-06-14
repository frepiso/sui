const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const LoaderUniversalOptionsPlugin = require('./plugins/loader-options')
const babelRules = require('./shared/module-rules-babel')
require('./shared/shims')

let pwd = process.cwd()

// hack for Windows, as process.env.PWD is undefined in that environment
// https://github.com/mrblueblue/gettext-loader/issues/18
// Moreover, to have same caseing we need to map it.
if (process.platform === 'win32') {
  const [driveLetter, path] = pwd.split(':')
  pwd = [driveLetter.toLowerCase(), path].join(':')
  process.env.PWD = pwd
}

const {
  envVars,
  MAIN_ENTRY_POINT,
  config,
  whenInstalled,
  cleanList
} = require('./shared')

let webpackConfig = {
  mode: 'development',
  context: path.resolve(pwd, 'src'),
  resolve: {
    extensions: ['*', '.js', '.jsx', '.json']
  },
  entry: cleanList([
    whenInstalled('react', 'react-hot-loader/patch'),
    'webpack-hot-middleware/client?reload=true',
    MAIN_ENTRY_POINT
  ]),
  target: 'web',
  output: {
    publicPath: '/'
  },
  plugins: [
    new webpack.EnvironmentPlugin(envVars(config.env)),
    new webpack.DefinePlugin({
      __DEV__: true,
      __BASE_DIR__: JSON.stringify(process.env.PWD)
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: true,
      env: process.env
    }),
    new LoaderUniversalOptionsPlugin(require('./shared/loader-options'))
  ],
  module: {
    rules: [
      babelRules,
      {
        test: /(\.css|\.scss)$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
      }
    ]
  }
}

module.exports = webpackConfig
