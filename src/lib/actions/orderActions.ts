"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function placeOrderAction(orderData: any, cart: any[]) {
  try {
    // 1. Ensure serializable data
    const cleanOrderData = JSON.parse(JSON.stringify(orderData));

    const result = await adminDb.runTransaction(async (transaction) => {
      const stockUpdates = [];

      for (const item of cart) {
        const productRef = adminDb.collection("products").doc(item.id);
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists) {
          throw new Error(`Product ${item.title} not found!`);
        }

        const currentStock = productSnap.data()?.stock ?? 0;
        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.title}. Available: ${currentStock}`);
        }

        stockUpdates.push({ ref: productRef, quantity: item.quantity });
      }

      // 2. Create Order
      const newOrderRef = adminDb.collection("orders").doc();
      transaction.set(newOrderRef, {
        ...cleanOrderData,
        id: newOrderRef.id,
        createdAt: new Date().toISOString(),
        // serverTimestamp hum direct yahan se bhi de sakte hain
        processedAt: FieldValue.serverTimestamp(), 
      });

      // 3. Update Stocks
      for (const update of stockUpdates) {
        transaction.update(update.ref, {
          stock: FieldValue.increment(-update.quantity)
        });
      }

      return { success: true, orderId: newOrderRef.id };
    });

    return result;

  } catch (error: any) {
    console.error("ADMIN_ACTION_ERROR:", error);
    // Asli error message return karein taake frontend par dikhe
    return { 
      success: false, 
      error: error.message || "Transaction failed" 
    };
  }
}

// import { db } from "@/lib/firebase";
// import { collection, doc, setDoc, updateDoc, getDoc } from "firebase/firestore";

// export async function placeOrderAction(orderData: any, cart: any[]) {
//   try {
//     // Check if we are actually getting data
//     if (!cart || cart.length === 0) throw new Error("Cart is empty");

//     // Process items one by one
//     for (const item of cart) {
//       const productRef = doc(db, "products", item.id);
      
//       // Connection try
//       const productSnap = await getDoc(productRef);
      
//       if (!productSnap.exists()) {
//         throw new Error(`Product not found: ${item.title}`);
//       }

//       const newStock = (productSnap.data().stock || 0) - item.quantity;
      
//       if (newStock < 0) {
//         throw new Error(`Out of stock: ${item.title}`);
//       }

//       // Update Stock
//       await updateDoc(productRef, { stock: newStock });
//     }

//     // Create Order
//     const newOrderRef = doc(collection(db, "orders"));
//     await setDoc(newOrderRef, {
//       ...orderData,
//       id: newOrderRef.id,
//       createdAt: new Date().toISOString(),
//     });

//     return { success: true, orderId: newOrderRef.id };

//   } catch (error: any) {
//     console.error("DEBUG_ERROR:", error);
//     return { 
//       success: false, 
//       error: error.message.includes("offline") 
//         ? "Network Error: Please check your internet connection." 
//         : error.message 
//     };
//   }
// }