const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');
const { sendPushNotification } = require('./push_notification_server');

const firebaseConfig = {
  apiKey: "AIzaSyAtIEXQOp3bvTk-zpLw533kI4NjaAJE3TY",
  authDomain: "lens-of-lakshay.firebaseapp.com",
  projectId: "lens-of-lakshay",
  storageBucket: "lens-of-lakshay.firebasestorage.app",
  messagingSenderId: "957500636729",
  appId: "1:957500636729:web:03ad440a7b19dc17d117e8",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COUPLE_ID = 'our-happy-space';
const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

async function checkAndSendUnfinishedReminders() {
  console.log(`[Scheduler] Checking for unfinished tasks at ${new Date().toLocaleTimeString()}...`);

  try {
    // 1. Query unfinished items in the couple space
    const itemsCol = collection(db, 'couples', COUPLE_ID, 'items');
    const q = query(itemsCol, where('isCompleted', '==', false));
    const itemsSnapshot = await getDocs(q);

    if (itemsSnapshot.empty) {
      console.log('[Scheduler] No unfinished tasks found! Everything is completed ✨');
      return;
    }

    const unfinishedItems = itemsSnapshot.docs.map(doc => doc.data());
    const count = unfinishedItems.length;
    const taskNames = unfinishedItems.slice(0, 3).map(i => `"${i.text}"`).join(', ');
    const moreSuffix = count > 3 ? ` and ${count - 3} more` : '';

    const title = `Reminder: ${count} Pending Task${count > 1 ? 's' : ''} ⏰`;
    const body = `Still unfinished: ${taskNames}${moreSuffix}. Let's get them done! 💕`;

    console.log(`[Scheduler] Found ${count} unfinished tasks. Preparing notification: "${body}"`);

    // 2. Fetch member device tokens
    const membersSnapshot = await getDocs(collection(db, 'couples', COUPLE_ID, 'members'));
    let sentCount = 0;

    for (const memberDoc of membersSnapshot.docs) {
      const member = memberDoc.data();
      if (member.fcmToken) {
        console.log(`[Scheduler] Sending push notification to ${member.name}...`);
        try {
          const res = await sendPushNotification(member.fcmToken, title, body, {
            coupleId: COUPLE_ID,
            type: 'PERIODIC_UNFINISHED_REMINDER',
          });
          console.log(`[Scheduler] Sent to ${member.name}:`, JSON.stringify(res));
          sentCount++;
        } catch (err) {
          console.error(`[Scheduler] Failed to send to ${member.name}:`, err);
        }
      }
    }

    console.log(`[Scheduler] Unfinished reminder cycle completed. Sent to ${sentCount} devices.`);
  } catch (error) {
    console.error('[Scheduler] Error checking unfinished tasks:', error);
  }
}

// Export for use in other scripts or testing
module.exports = {
  checkAndSendUnfinishedReminders,
};

if (require.main === module) {
  const runOnce = process.argv.includes('--once');

  if (runOnce) {
    console.log('⏰ Running one-time unfinished task reminder check...');
    checkAndSendUnfinishedReminders().then(() => {
      console.log('Done.');
      process.exit(0);
    }).catch((err) => {
      console.error(err);
      process.exit(1);
    });
  } else {
    console.log('⏰ Starting 3-Hour Unfinished Task Reminder Service...');
    console.log(`Checking couple space: "${COUPLE_ID}" every 3 hours.`);

    // Run immediately once on start
    checkAndSendUnfinishedReminders();

    // Schedule every 3 hours
    setInterval(checkAndSendUnfinishedReminders, THREE_HOURS_MS);
  }
}

