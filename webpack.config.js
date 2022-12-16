const path = require('path');

const server = {
    entry: './src/index.ts',
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: ['ts-loader'],
                exclude: /node_modules/,
            },
        ]
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
        clean: true,
    }
};

const client = {
    entry: './src/index.ts',
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: ['ts-loader'],
                exclude: /node_modules/,
            },
        ]
    },
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            'fs': false,
            'net': false,
            'path': false,
            'util': false,
            'assert': false,
            'url': false,
            'http': false,
            'https': false,
            'tls': false,
        },
    },
    target: 'web',
    node: { global: true },
    output: {
        filename: 'client.js',
        library: 'workspace-client',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, 'dist'),
        globalObject: 'this',
        clean: true,
    }
};

module.exports = [client, server];
