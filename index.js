import { registerRootComponent } from 'expo';
import App from './App'; // Make sure this path is correct
import { enableScreens } from 'react-native-screens';
import { LogBox } from 'react-native';
import '@azure/core-asynciterator-polyfill';


LogBox.ignoreLogs(['AsyncStorage has been extracted from react-native core']);

enableScreens();

// Add this line
if (module.exports == null) {
  module.exports = {};
}

registerRootComponent(App);