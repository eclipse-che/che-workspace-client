const path = require('path');

const server = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['eslint-loader'],
      },
      {
        test: /\.ts$/,
        use: ['ts-loader'],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  target: 'node',
  output: {
    filename: 'server.js',
    library: 'workspace-client',
    libraryTarget: 'umd',
    globalObject: 'this',
    path: path.resolve(__dirname, 'dist'),
  },
};

const client = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['eslint-loader'],
      },
      {
        test: /\.ts$/,
        use: ['ts-loader'],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  target: 'web',
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
  output: {
    filename: 'client.js',
    library: 'workspace-client',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
  },
};

module.exports = [client, server];
