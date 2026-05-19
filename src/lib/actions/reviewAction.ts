"use server"
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, increment } from "firebase/firestore";

export async function submitReviewAction(reviewData: {
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
}) {
  try {
    // 1. Add review to 'reviews' collection
    await addDoc(collection(db, "reviews"), {
      ...reviewData,
      createdAt: new Date().toISOString(),
    });

    // 2. Optional: Product document mein average rating update karne ka logic yahan aa sakta hai
    // Abhi ke liye hum sirf save kar rahe hain.
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}