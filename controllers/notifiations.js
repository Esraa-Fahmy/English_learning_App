const admin = require("../config/firebase");

const sendFirebaseNotification = async ({ title, body }) => {
  const messagePayload = {
    notification: { title, body },
    topic: "allUsers",
  };

  try {
    await admin.messaging().send(messagePayload);
   
  } catch (error) {
    console.error("Firebase Notification Error:", error);
  }
};

module.exports = sendFirebaseNotification;
