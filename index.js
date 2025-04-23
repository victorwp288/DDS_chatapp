// START INSERT: Required polyfills/imports for signal-protocol-react-native
// import "react-native-get-random-values"; // Removed - Reverting Signal changes
// import 'react-native-securerandom';
// import 'expo-random';
// import 'isomorphic-webcrypto';
// END INSERT

// import { Buffer } from "buffer"; // Removed - Reverting Signal changes
// global.Buffer = Buffer; // Removed - Reverting Signal changes

import { registerRootComponent } from "expo";

import App from "./App";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
