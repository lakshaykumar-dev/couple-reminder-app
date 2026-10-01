const { initializeApp } = require('firebase/app');
const { getFirestore, collection, onSnapshot, query, orderBy, limit, getDocs } = require('firebase/firestore');
const { sendPushNotification } = require('./push_notification_server');

// Firebase Web config
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

const coupleId = 'our-happy-space';

console.log(`[Push Listener] Started listening to couple space: "${coupleId}"...`);

let isFirstSnapshot = true;

const activitiesCol = collection(db, 'couples', coupleId, 'activities');
const q = query(activitiesCol, orderBy('timestamp', 'desc'), limit(5));

onSnapshot(q, async (snapshot) => {
  if (isFirstSnapshot) {
    isFirstSnapshot = false;
    console.log('[Push Listener] Initial snapshot loaded. Ready for real-time events!');
    return;
  }

  snapshot.docChanges().forEach(async (change) => {
    if (change.type === 'added') {
      const data = change.doc.data();
      const actorName = data.actorName || 'Partner';
      const message = data.message || 'Updated the list';
      console.log(`[Push Listener] New activity detected: "${message}" by ${actorName}`);

      // Query members to find partner FCM token
      try {
        const membersSnap = await getDocs(collection(db, 'couples', coupleId, 'members'));
        membersSnap.forEach(async (docSnap) => {
          const member = docSnap.data();
          if (
            member.name?.toLowerCase().trim() !== actorName.toLowerCase().trim() &&
            member.fcmToken
          ) {
            console.log(`[Push Listener] Sending push notification to ${member.name}...`);
            const res = await sendPushNotification(
              member.fcmToken,
              `${actorName} updated list 💕`,
              message,
              { coupleId }
            );
            console.log('[Push Listener] Send result:', JSON.stringify(res));
          }
        });
      } catch (err) {
        console.error('[Push Listener] Error sending push notification:', err);
      }
    }
  });
});
