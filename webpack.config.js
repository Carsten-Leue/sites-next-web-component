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
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'bundle.js',
    library: name,
    libraryTarget: 'umd',
    path: resolve(__dirname, 'dist'),
  },
};