const fs = require('fs');
const crypto = require('crypto');

// Load Service Account Key
const keyFiles = fs.readdirSync('.').filter(f => f.includes('firebase-adminsdk') && f.endsWith('.json'));
if (keyFiles.length === 0) {
  console.error('No service account key found.');
  process.exit(1);
}
const sa = JSON.parse(fs.readFileSync(keyFiles[0], 'utf8'));

let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && tokenExpiry > now + 60) {
    return cachedToken;
  }

  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  function b64(obj) {
    return Buffer.from(JSON.stringify(obj)).toString('base64url');
  }

  const unsigned = b64(header) + '.' + b64(claim);
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  const signature = signer.sign(sa.private_key, 'base64url');
  const jwt = unsigned + '.' + signature;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error('Failed to get OAuth token: ' + JSON.stringify(data));
  }

  cachedToken = data.access_token;
  tokenExpiry = now + 3500;
  return cachedToken;
}

/**
 * Send FCM Push Notification using Google FCM HTTP v1 API
 */
async function sendPushNotification(fcmToken, title, body, data = {}) {
  const accessToken = await getAccessToken();
  const url = `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`;

  const payload = {
    message: {
      token: fcmToken,
      notification: {
        title,
        body,
      },
      data: {
        ...data,
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channel_id: 'couple_reminders',
        },
      },
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  return json;
}

module.exports = {
  sendPushNotification,
  getAccessToken,
};

if (require.main === module) {
  console.log('Push notification service loaded for project:', sa.project_id);
}
