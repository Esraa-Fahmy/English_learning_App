/*const admin = require('firebase-admin');
const WebSocket = require('ws');

// إعداد Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// قائمة المتصلين عبر WebSocket
const connectedClients = new Set();

// إنشاء WebSocket Server
function initWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    connectedClients.add(ws);
    ws.on('close', () => {
      connectedClients.delete(ws);
    });
  });
}

// إرسال إشعارات داخل التطبيق عبر WebSocket
function sendInAppNotification(message) {
  connectedClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ notification: message }));
    }
  });
}

// إرسال إشعارات خارج التطبيق عبر FCM
async function sendPushNotification(title, body, topic) {
  const message = {
    notification: { title, body },
    topic,
  };

  try {
    await admin.messaging().send(message);
    console.log('FCM Notification sent successfully');
  } catch (error) {
    console.error('Error sending FCM Notification:', error);
  }
}

module.exports = {
  initWebSocket,
  sendInAppNotification,
  sendPushNotification,
};
*/