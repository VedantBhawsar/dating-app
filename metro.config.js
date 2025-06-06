// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add additional asset extensions for proper handling
config.resolver.assetExts.push(
  // Add your additional asset extensions here if needed
  'db',
  'json',
  'mp3',
  'ttf',
  'obj',
  'png',
  'jpg',
  'jpeg'
);

// Optimize the resolver
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];

// Increase the max workers if needed
config.maxWorkers = 4;

// Increase memory limit
config.transformer.minifierConfig = {
  compress: {
    reduce_vars: false,
  },
};

module.exports = config;
