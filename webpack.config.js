const path = require('path');

const server = {
    entry: './src/index.ts',
    mode: 'production',
    module: {
        rules: [
          {
            test: /\.ts$/,
            enforce: 'pre',
            include: path.join(__dirname, 'src'),
            exclude: /node_modules/,
            use: [{
              loader: 'eslint-loader',
              options: {
                cache: true,
              }
            }],
          }, {
                test: /\.ts$/,
                use: ['ts-loader'],
                exclude: /node_modules/,
            }, {
                test: /prettier/,
                use: ['null-loader']
          },
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    target: 'node',
    output: {
        filename: 'server.js',
        library: 'workspace-client',
        libraryTarget: 'umd',
        globalObject: 'this',
        path: path.resolve(__dirname, 'dist')
    }
};

const client = {
    entry: './src/index.ts',
    mode: 'production',
    module: {
        rules: [
          {
            test: /\.ts$/,
            enforce: 'pre',
            include: path.join(__dirname, 'src'),
            exclude: /node_modules/,
            use: [{
              loader: 'eslint-loader',
              options: {
                cache: true,
              }
            }],
          }, {
                test: /\.ts$/,
                use: ['ts-loader'],
                exclude: /node_modules/,
            }, {
                test: /prettier/,
                use: ['null-loader']
            },
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    target: 'web',
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
    output: {
        filename: 'client.js',
        library: 'workspace-client',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, 'dist')
    }
};

module.exports = [client, server];
