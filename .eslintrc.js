module.exports = {
  parser: '@babel/eslint-parser',
  // Disable config file checking
  root: true,
  requireConfigFile: false,
  extends: ['@react-native', 'plugin:react-hooks/recommended'],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'react-native/no-inline-styles': 0,
    'prettier/prettier': [
      'error',
      {
        'no-inline-styles': false,
      },
    ],
  },
};
