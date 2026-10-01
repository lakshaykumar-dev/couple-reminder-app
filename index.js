/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// Handle background and quit-state FCM push notifications
try {
  const messaging = getMessaging();
  setBackgroundMessageHandler(messaging, async (remoteMessage) => {
    console.log('[FCM] Background message received:', remoteMessage);
  });
} catch (e) {
  console.log('[FCM] Error setting background handler:', e);
}

AppRegistry.registerComponent(appName, () => App);
