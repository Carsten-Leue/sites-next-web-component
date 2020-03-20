const { resolve } = require('path');
const { readFileSync } = require('fs');
const { name } = JSON.parse(readFileSync(resolve(__dirname, 'package.json')));

module.exports = {
  entry: './src/index.ts',
  mode: "production",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      }
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  externals: {
    '@acoustic-content-sdk/web-components-services': '@acoustic-content-sdk/web-components-services'
  },
  output: {
    filename: 'bundle.js',
    library: name,
    libraryTarget: 'umd',
    path: resolve(__dirname, 'dist'),
  },
};