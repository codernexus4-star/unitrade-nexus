const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Force specific hostname for iPhone testing
process.env.REACT_NATIVE_PACKAGER_HOSTNAME = '192.168.1.155';

module.exports = config;
