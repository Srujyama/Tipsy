import {initializeApp} from 'firebase/app';
// @ts-ignore - getReactNativePersistence exists in the RN bundle
import {initializeAuth, getReactNativePersistence} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
// @ts-ignore - RN async storage v2 default export
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCLKqdwZmeVzJhLSMTRgFwQwfUrpDIfFT8',
  authDomain: 'tipsy-app-rn.firebaseapp.com',
  projectId: 'tipsy-app-rn',
  storageBucket: 'tipsy-app-rn.firebasestorage.app',
  messagingSenderId: '1036146163778',
  appId: '1:1036146163778:web:690f8ff725f3ce9e1faddb',
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const db = getFirestore(app);
