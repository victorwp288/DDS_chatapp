const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    events: require.resolve('./eventsPolyfill.js'),
    crypto: require.resolve('./cryptoPolyfill.js'),
    process: require.resolve('process'),
    buffer: require.resolve('./bufferPolyfill.js'),
  },
  nodeModulesPaths: [require('path').resolve(__dirname, 'node_modules')],
  sourceExts: [...config.resolver.sourceExts, 'js', 'jsx', 'ts', 'tsx'],
};

module.exports = withNativeWind(config, { input: './globals.css' });