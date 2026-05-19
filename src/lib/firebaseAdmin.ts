import admin from "firebase-admin";

if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error("FIREBASE_PRIVATE_KEY is not set in environment variables");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Ye line zaroori hai — env vars mein \n literal string hoti hai
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

export const adminDb = admin.firestore();