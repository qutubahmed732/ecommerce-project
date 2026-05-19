"use client";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading); // Loading state control karne ke liye

  useEffect(() => {
    // 1. Check shuru hote hi loading true kar dein
    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User login hai, Firestore se role fetch karte hain
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Store mein user aur role dono set karein
            setAuth(firebaseUser, userData.role);
          } else {
            // Agar doc nahi milta (rare case), tab bhi loading stop karein
            setAuth(firebaseUser, null);
          }
        } else {
          // 2. Agar Firebase mein user null hai, toh Zustand ko bhi clear karein
          setAuth(null, null);
        }
      } catch (error) {
        console.error("Auth Provider Error:", error);
        setAuth(null, null);
      } finally {
        // 3. Har haal mein loading false karein jab process khatam ho jaye
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setAuth, setLoading]);

  return <>{children}</>;
}