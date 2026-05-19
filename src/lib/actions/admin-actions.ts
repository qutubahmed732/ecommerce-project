"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath } from "next/cache";

export async function deleteProductAdmin(productId: string) {
  try {
    await adminDb.collection("products").doc(productId).delete();
    
    // Taake page foran refresh ho aur product list se nikal jaye
    revalidatePath("/admin/products");
    
    return { success: true };
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false };
  }
}