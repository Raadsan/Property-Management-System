import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// You need to place your serviceAccountKey.json in this directory
// or set the GOOGLE_APPLICATION_CREDENTIALS environment variable.
// For simplicity, we will assume the file is at ./serviceAccountKey.json

import { createRequire } from "module";
const require = createRequire(import.meta.url);

let serviceAccount;
try {
  serviceAccount = require("../serviceAccountKey.json");
} catch (error) {
  console.warn("⚠️ Firebase serviceAccountKey.json not found. Social login verification will fail.");
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const verifyFirebaseToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    throw error;
  }
};

export default admin;
