const admin = require("firebase-admin");

// Parse the service account JSON from an environment variable
const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
module.exports = { db };
