const { getDefaultConfig } = require('expo/metro-config');
const { mergeConfig } = require('@react-native/metro-config');

const config = (() => {
  const expoConfig = getDefaultConfig(__dirname);

  const { transformer, resolver } = expoConfig;

  return {
    transformer: {
      ...transformer,
      babelTransformerPath: require.resolve("react-native-svg-transformer")
    },
    resolver: {
      ...resolver,
      assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
      sourceExts: [...resolver.sourceExts, "svg"],
      extraNodeModules: {
        ...resolver.extraNodeModules,
        'uuid': require.resolve('uuid'),
      },
    }
  };
})();

module.exports = mergeConfig(getDefaultConfig(__dirname), config);