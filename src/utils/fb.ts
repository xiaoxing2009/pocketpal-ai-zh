import '@react-native-firebase/app-check';
import firebase from '@react-native-firebase/app';
import {APPCHECK_DEBUG_TOKEN_ANDROID, APPCHECK_DEBUG_TOKEN_IOS} from '@env';

// Track initialization status
let isAppCheckInitialized = false;

export const initializeAppCheck = () => {
  if (isAppCheckInitialized) {
    return;
  }

  try {
    const rnfbProvider = firebase
      .appCheck()
      .newReactNativeFirebaseAppCheckProvider();

    rnfbProvider.configure({
      android: {
        provider: __DEV__ ? 'debug' : 'playIntegrity',
        debugToken: APPCHECK_DEBUG_TOKEN_ANDROID,
      },
      apple: {
        provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback',
        debugToken: APPCHECK_DEBUG_TOKEN_IOS,
      },
    });
    firebase.appCheck().initializeAppCheck({
      provider: rnfbProvider,
      isTokenAutoRefreshEnabled: true,
    });

    isAppCheckInitialized = true;
  } catch (error) {
    console.error('Failed to initialize Firebase App Check:', error);
  }
};

// Get a fresh App Check token
export const getAppCheckToken = async () => {
  try {
    if (!firebase.appCheck) {
      throw new Error('Firebase App Check module is not available');
    }
    const {token} = await firebase.appCheck().getToken(true);
    return token;
  } catch (error) {
    console.error('Failed to get App Check token:', error);
    throw error;
  }
};
