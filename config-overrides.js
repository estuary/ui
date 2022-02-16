const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

// https://github.com/facebook/create-react-app/issues/11756#issuecomment-1016688275
// Since WebPack 5 no longer polyfills NodeJS stuff we have to manually do it
module.exports = function override(config, env) {
    config.plugins.push(
        new NodePolyfillPlugin({
            excludeAliases: [
                'assert',
                'console',
                'constants',
                'crypto',
                'domain',
                'events',
                'http',
                'https',
                'os',
                'punycode',
                'querystring',
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
    return config;
};
