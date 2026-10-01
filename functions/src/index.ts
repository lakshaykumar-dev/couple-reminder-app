import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

admin.initializeApp();

/**
 * Triggered automatically by Firestore whenever an item is added
 */
export const onItemCreated = onDocumentCreated(
  'couples/{coupleId}/items/{itemId}',
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const item = snapshot.data();
    const coupleId = event.params.coupleId;
    const authorName = item.addedBy || 'Partner';
    const tabName = item.tabName || 'List';
    const itemText = item.text || 'New Item';

    // Query partner's FCM tokens
    const membersSnap = await admin
      .firestore()
      .collection(`couples/${coupleId}/members`)
      .get();

    const tokensToSend: string[] = [];
    membersSnap.forEach((doc) => {
      const member = doc.data();
      if (
        member.name?.toLowerCase().trim() !== authorName.toLowerCase().trim() &&
        member.fcmToken
      ) {
        tokensToSend.push(member.fcmToken);
      }
    });

    if (tokensToSend.length === 0) {
      console.log(`No partner FCM tokens found for coupleId: ${coupleId}`);
      return;
    }

    // Send FCM notification
    const response = await admin.messaging().sendEachForMulticast({
      tokens: tokensToSend,
      notification: {
        title: `${authorName} updated ${tabName} 💕`,
        body: `Added: "${itemText}"`,
      },
      data: {
        coupleId,
        tabId: item.tabId || '',
        itemId: event.params.itemId,
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'couple_reminders',
        },
      },
    });

    console.log(`FCM sent successfully to ${response.successCount} devices.`);
  }
);

/**
 * Triggered automatically by Firestore when an item is checked or edited
 */
export const onItemUpdated = onDocumentUpdated(
  'couples/{coupleId}/items/{itemId}',
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    // Check if item was completed
    const justCompleted = !before.isCompleted && after.isCompleted;
    if (!justCompleted) return;

    const coupleId = event.params.coupleId;
    const completedBy = after.completedBy || 'Partner';
    const itemText = after.text || 'Item';
    const tabName = after.tabName || 'List';

    const membersSnap = await admin
      .firestore()
      .collection(`couples/${coupleId}/members`)
      .get();

    const tokensToSend: string[] = [];
    membersSnap.forEach((doc) => {
      const member = doc.data();
      if (
        member.name?.toLowerCase().trim() !== completedBy.toLowerCase().trim() &&
        member.fcmToken
      ) {
        tokensToSend.push(member.fcmToken);
      }
    });

    if (tokensToSend.length === 0) return;

    await admin.messaging().sendEachForMulticast({
      tokens: tokensToSend,
      notification: {
        title: `Item Completed! ✨`,
        body: `${completedBy} completed "${itemText}" in ${tabName}`,
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'couple_reminders',
        },
      },
    });
  }
);
