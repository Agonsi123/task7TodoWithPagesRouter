const admin = require('firebase-admin');

// This check prevents re-initialization during Next.js hot-reloading in dev
if (!admin.apps.length) {
  try {
    const encodedCredentials = process.env.FIREBASE_ADMIN_CREDENTIALS_BASE64;

    if (!encodedCredentials) {
      // It's crucial to throw an error if the variable isn't found
      throw new Error('FIREBASE_ADMIN_CREDENTIALS_BASE64 environment variable is not set. Cannot initialize Firebase Admin SDK.');
    }

    // Decode the Base64 string back to a Buffer, then convert to UTF-8 string, then parse JSON
    const decodedBuffer = Buffer.from(encodedCredentials, 'base64');
    const serviceAccount = JSON.parse(decodedBuffer.toString('utf8'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // If am using Realtime Database,I add its URL here:
      // databaseURL: "https://my-project-id.firebaseio.com",
    });
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
    // I might want to re-throw or handle more gracefully depending on my app's needs
    process.exit(1); // Exit process if critical initialization fails
  }
}

const db = admin.firestore(); // Get the Firestore instance
const auth = admin.auth();     // Get the Auth instance (for token verification)

module.exports = { admin, db, auth };
