import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

admin.initializeApp();

/**
 * 1. Real-time Trigger: Whenever an item is added
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

    if (tokensToSend.length === 0) return;

    await admin.messaging().sendEachForMulticast({
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
  }
);

/**
 * 2. Real-time Trigger: Whenever an item is checked as completed
 */
export const onItemUpdated = onDocumentUpdated(
  'couples/{coupleId}/items/{itemId}',
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

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

/**
 * 3. Scheduled Trigger: Runs every 3 hours to remind of unfinished tasks
 */
export const checkUnfinishedTasksEvery3Hours = onSchedule(
  {
    schedule: 'every 3 hours',
    timeZone: 'Asia/Kolkata',
  },
  async (event) => {
    const firestore = admin.firestore();
    const couplesSnap = await firestore.collection('couples').get();

    for (const coupleDoc of couplesSnap.docs) {
      const coupleId = coupleDoc.id;

      // Query incomplete items
      const itemsSnap = await firestore
        .collection(`couples/${coupleId}/items`)
        .where('isCompleted', '==', false)
        .get();

      if (itemsSnap.empty) continue;

      const unfinishedCount = itemsSnap.size;
      const sampleItems = itemsSnap.docs
        .slice(0, 3)
        .map((d) => `"${d.data().text}"`)
        .join(', ');
      const moreText = unfinishedCount > 3 ? ` and ${unfinishedCount - 3} more` : '';

      // Get member FCM tokens
      const membersSnap = await firestore
        .collection(`couples/${coupleId}/members`)
        .get();

      const tokens: string[] = [];
      membersSnap.forEach((mDoc) => {
        const data = mDoc.data();
        if (data.fcmToken) {
          tokens.push(data.fcmToken);
        }
      });

      if (tokens.length === 0) continue;

      await admin.messaging().sendEachForMulticast({
        tokens,
        notification: {
          title: `Reminder: ${unfinishedCount} Pending Task${unfinishedCount > 1 ? 's' : ''} ⏰`,
          body: `Still unfinished: ${sampleItems}${moreText}. Let's get them done! 💕`,
        },
        data: {
          coupleId,
          type: 'PERIODIC_UNFINISHED_REMINDER',
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'couple_reminders',
          },
        },
      });

      console.log(`Sent 3-hour reminder to couple ${coupleId}: ${unfinishedCount} pending tasks.`);
    }
  }
);
