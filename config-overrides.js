const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const webpack = require('webpack');

// https://github.com/facebook/create-react-app/issues/11756#issuecomment-1016688275
// Since WebPack 5 no longer polyfills NodeJS stuff we have to manually do it
module.exports = function override(config) {
    config.plugins.push(
        new NodePolyfillPlugin({
            excludeAliases: [
                'assert',
                'buffer',
                'console',
                'constants',
                'crypto',
                'domain',
                'events',
                'http',
                'https',
                'os',
                //'path',
                'punycode',
                //'process',
                'querystring',
                //'stream',
                '_stream_duplex',
                '_stream_passthrough',
                '_stream_transform',
                '_stream_writable',
                'string_decoder',
                'sys',
                'timers',
                'tty',
                'url',
                'util',
                'vm',
                'zlib',
            ],
        })
    );

    // This is here to get WASM modules working. It was adapted from this comment:
    // https://github.com/Emurgo/cardano-serialization-lib/issues/295#issuecomment-995943141
    // I do not actually understand all of this.
    // We do not use the WasmPack Plugin because that would compile the Rust code to WASM dynamically,
    // complicating the build process significantly.
    const wasmExtensionRegExp = /\.wasm$/;
    config.resolve.extensions.push('.wasm');
    config.experiments = {
        asyncWebAssembly: true,
        syncWebAssembly: false,
    };
    config.resolve.fallback = {
        buffer: require.resolve('buffer/')
    }
    config.module.rules.forEach((rule) => {
        (rule.oneOf || []).forEach((oneOf) => {
            if (oneOf.type === "asset/resource") {
                oneOf.exclude.push(wasmExtensionRegExp);
            }
        });
    });
    config.plugins.push(new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
    }));
    return config;
};
