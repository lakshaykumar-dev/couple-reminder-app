import { PermissionsAndroid, Platform } from 'react-native';
import {
  getMessaging,
  getToken,
  requestPermission,
  onMessage,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Request notification permissions (required on Android 13+ / API 33+)
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    }

    const messaging = getMessaging();
    const authStatus = await requestPermission(messaging);
    return (
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL
    );
  } catch (error) {
    console.warn('Notification permission request error:', error);
    return false;
  }
}

/**
 * Register device FCM token and save it in Firestore under the couple's space
 */
export async function registerDeviceToken(coupleId: string, myName: string): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('Push notification permission denied by user.');
      return null;
    }

    const messaging = getMessaging();

    try {
      await registerDeviceForRemoteMessages(messaging);
    } catch (e) {
      // Ignore if not supported / Android
    }

    const token = await getToken(messaging);
    if (!token) {
      console.log('Failed to obtain FCM token.');
      return null;
    }

    console.log(`[FCM] Obtained device token for ${myName}:`, token.substring(0, 15) + '...');

    // Save token in Firestore under couples/{coupleId}/members/{myName}
    const memberDoc = doc(db, 'couples', coupleId, 'members', myName.toLowerCase().trim());
    await setDoc(
      memberDoc,
      {
        name: myName,
        fcmToken: token,
        platform: Platform.OS,
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    // Listen for token refreshes
    onTokenRefresh(messaging, async (newToken: string) => {
      console.log('[FCM] Token refreshed:', newToken.substring(0, 15) + '...');
      await setDoc(
        memberDoc,
        {
          name: myName,
          fcmToken: newToken,
          platform: Platform.OS,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    });

    return token;
  } catch (error) {
    console.error('Error registering device token:', error);
    return null;
  }
}

/**
 * Subscribe to foreground messages
 */
export function onForegroundMessage(callback: (title: string, body: string) => void) {
  const messaging = getMessaging();
  return onMessage(messaging, async (remoteMessage) => {
    console.log('[FCM] Foreground message received:', remoteMessage);
    const title = remoteMessage.notification?.title || 'Couple Reminder 💕';
    const body = remoteMessage.notification?.body || '';
    if (body) {
      callback(title, body);
    }
  });
}
