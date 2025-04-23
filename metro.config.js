const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Removed resolver config for Node module polyfills

module.exports = withNativeWind(config, { input: "./globals.css" });

// Removed comment about helper dependencies
