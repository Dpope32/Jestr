import {registerRootComponent} from 'expo';
import App from './App';
// import { enableScreens } from 'react-native-screens';
import {LogBox} from 'react-native';
import '@azure/core-asynciterator-polyfill';

LogBox.ignoreLogs([
  'AsyncStorage has been extracted from react-native core',
  'source.uri should not be an empty string',
]);

// LogBox.ignoreAllLogs();

// enableScreens();

// Add this line
if (module.exports == null) {
  module.exports = {};
}

registerRootComponent(App);
