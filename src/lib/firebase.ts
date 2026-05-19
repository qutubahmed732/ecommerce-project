import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBemNzkHLH6YgJWqxd1DyWwrkVj7tlCeEg",
  authDomain: "e-commerce-cabd1.firebaseapp.com",
  projectId: "e-commerce-cabd1",
  storageBucket: "e-commerce-cabd1.firebasestorage.app",
  messagingSenderId: "528733334669",
  appId: "1:528733334669:web:1b3f00010267ad359cc6c4",
  measurementId: "G-2TEQ7YH8YP"
};
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };