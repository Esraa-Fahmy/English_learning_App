const admin = require("firebase-admin");
const path = require("path");

// تحميل ملف إعدادات Firebase
const serviceAccount = require(path.join(__dirname, "../stories-app-73826-firebase-adminsdk-fbsvc-fae6d294e4.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
