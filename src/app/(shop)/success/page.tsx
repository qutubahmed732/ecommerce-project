"use client"
import { useEffect, useRef, useState } from "react"
import { useCartStore } from "@/store/useCartStore"
import { useAuthStore } from "@/store/useAuthStore"
import { placeOrderAction } from "@/lib/actions/orderActions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"

export default function SuccessPage() {
  const { cart, clearCart } = useCartStore()
  // 🔹 useAuthStore se loading state bhi nikalein taake pata chale auth check chal raha hai
  const { user, loading: authLoading } = useAuthStore()
  
  const [isSaving, setIsSaving] = useState(true) 
  const [saveError, setSaveError] = useState<string | null>(null) // Error track karne ke liye
  const hasSaved = useRef(false)

  // 1. Total Price Calculation
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  useEffect(() => {
    // Agar abhi user ka data load ho raha hai Firebase se, toh ruk jao
    if (authLoading) return;

    const saveOrder = async () => {
      // 🔒 STRICT CHECK: User ho, cart mein items hon, aur pehle save na chal raha ho
      if (user && cart.length > 0 && !hasSaved.current) {
        hasSaved.current = true;
        setIsSaving(true); // Ensure loading is active

        const orderData = {
          userId: user.uid,
          userEmail: user.email || "",
          userName: user.displayName || "Customer",
          totalAmount: Number(calculateTotal().toFixed(2)),
          status: "paid", 
          items: cart,
          createdAt: new Date().toISOString()
        };

        try {
          // Database mein save hone ka intizar karo
          await placeOrderAction(orderData, cart);
          clearCart(); // 👈 Save hone ke BAAD hi cart khali hoga
          console.log("Order saved successfully!");
          setIsSaving(false); // 🔥 SUCCESS! Ab loading khatam karo aur UI dikhao
        } catch (err: any) {
          console.error("Database save error:", err);
          setSaveError(err.message || "Failed to save order to database.");
          hasSaved.current = false; // Error par retry ka chance do
          setIsSaving(false);
        }
      } 
      // 🔄 PAGE REFRESH CASE: Agar cart khali hai lekin save pehle ho chuka tha (ya cart zero tha waise hi)
      else if (cart.length === 0) {
        // Agar hasSaved true hai, iska matlab isi session mein save hua tha aur ab user ne refresh kiya hai
        setIsSaving(false);
      }
      // 👤 NO USER CASE: Agar auth loading khatam ho gayi aur user phir bhi nahi mila
      else if (!user) {
        setSaveError("User session not found. Please log in.");
        setIsSaving(false);
      }
    };

    saveOrder();
  }, [user, authLoading, cart, clearCart]);

  const handleFinalRedirect = () => {
    window.location.href = "/";
  };

  // ⏳ 2. JAB TAK DATABASE MEIN SAVE NAHI HOTA, YEH SCREEN RUKHI RAHEGI
  if (isSaving) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">Securing your order...</h2>
        <p className="text-slate-500 mt-1">Please wait, saving your order details into our database.</p>
      </div>
    )
  }

  // ❌ 3. AGAR DATABASE MEIN SAVE FAIL HO JAYE
  if (saveError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="bg-rose-50 p-6 rounded-full mb-6">
          <XCircle size={60} className="text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong!</h1>
        <p className="text-slate-600 mb-8 text-center max-w-md">
          {saveError}. Please contact support if your payment was deducted.
        </p>
        <Link href="/">
          <Button className="bg-blue-600 hover:bg-blue-700">Go to Home</Button>
        </Link>
      </div>
    )
  }

  // 🎉 4. JAB PROPERLY SAVE HO JAYE, TOH YEH FINAL UI DIKHAO
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-in fade-in zoom-in duration-500">
      <div className="bg-green-50 p-6 rounded-full mb-6">
        <CheckCircle2 size={60} className="text-green-500 animate-bounce" />
      </div>
      
      <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Order Confirmed!</h1>
      <p className="text-slate-600 mb-8 text-center max-w-md text-lg">
        Woohoo! Aapka order mil gaya hai. Aapki payment successful rahi aur order database mein kamiyabi se save ho chuka hai.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/user-dashboard">
          <Button variant="outline" className="w-full sm:w-auto border-2">
            My Orders
          </Button>
        </Link>

        <Button
          onClick={handleFinalRedirect}
          className="bg-blue-600 hover:bg-blue-700 shadow-xl px-10 rounded-full font-bold transition-all hover:scale-105"
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  )
}