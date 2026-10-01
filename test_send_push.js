const { sendPushNotification } = require('./push_notification_server');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

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

async function testPush() {
  const memberSnap = await getDoc(doc(db, 'couples', 'our-happy-space', 'members', 'lakshay'));
  if (!memberSnap.exists()) {
    console.log('Member lakshay not found in Firestore!');
    return;
  }
  const data = memberSnap.data();
  console.log('Found FCM Token for Lakshay:', data.fcmToken);

  console.log('Sending test push notification...');
  const res = await sendPushNotification(
    data.fcmToken,
    'Sam added to Grocery 💕',
    'Fresh Strawberries 🍓',
    { coupleId: 'our-happy-space' }
  );
  console.log('FCM Send Response:', JSON.stringify(res, null, 2));
}

testPush().catch(console.error);
