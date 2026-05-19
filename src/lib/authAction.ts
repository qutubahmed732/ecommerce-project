import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { UserRole } from "@/types";

export const signUpUser = async (email: string, pass: string, name: string, role: UserRole) => {
  try {
    // 1. Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    // 2. Save additional info (Role) in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: name,
      email: email,
      role: role, // 'USER' or 'VENDOR'
      createdAt: new Date().toISOString(),
    });

    return { user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const loginUser = async (email: string, pass: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    // Firestore se user ka role nikaalte hain
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();

    return { user, role: userData?.role, error: null };
  } catch (error: any) {
    return { user: null, role: null, error: error.message };
  }
};

export const logoutUser = async () => {
  await signOut(auth);
};