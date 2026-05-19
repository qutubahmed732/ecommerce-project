"use client"
import { useCartStore } from "@/store/useCartStore"
import { useAuthStore } from "@/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { placeOrderAction } from "@/lib/actions/orderActions";
import Navbar from "@/components/ui/Navbar"
import { Loader2, CreditCard, ShieldCheck } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const { cart, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  const handlePlaceOrder = async () => {
    // 1. Basic Safety Guard
    if (!user) {
      alert("Please login to complete your order.");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setIsProcessing(true);

    try {
      // 2. Stripe Session URL mangwao backend API se
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          userId: user.uid,
          userEmail: user.email || "",
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // 3. AGAR URL MIL GAYA HAI, TOH DIRECT REDIRECT KARO
      // Humain kisi extra field ya form ki zaroorat nahi hai, 
      // Stripe khud apna payment page load karega.
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Stripe URL missing from response.");
      }

    } catch (err: any) {
      console.error("Checkout Crash:", err);
      alert("Payment Error: " + (err.message || "Something went wrong"));
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto py-16 px-6">
        <div className="flex items-center gap-3 mb-10">
          <CreditCard className="w-8 h-8 text-blue-600" />
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Order Summary Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b bg-slate-50/50">
                <h2 className="font-bold text-slate-700">Review Your Items</h2>
              </div>
              <div className="divide-y">
                {cart.map((item) => (
                  <div key={item.id} className="p-6 flex justify-between items-center hover:bg-slate-50/30 transition-colors">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-none">{item.title}</p>
                        <p className="text-xs text-slate-400 mt-1">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-black text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="p-8 bg-blue-50/30">
                <div className="flex justify-between items-end">
                  <span className="text-slate-500 font-medium">Total Amount to Pay:</span>
                  <span className="text-3xl font-black text-blue-600">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment/Action Section */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-blue-100 sticky top-24">
              <div className="flex items-center gap-2 text-green-600 mb-6 bg-green-50 p-3 rounded-xl border border-green-100">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Secure Transaction</span>
              </div>

              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                By confirming this order, you authorize the processing of your items and inventory update.
              </p>

              <Button
                className={`w-full h-16 text-lg font-bold rounded-2xl transition-all shadow-lg ${isProcessing ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                  }`}
                onClick={handlePlaceOrder}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin h-5 w-5" />
                    Processing...
                  </div>
                ) : (
                  "Confirm & Place Order"
                )}
              </Button>

              <div className="mt-8 pt-6 border-t flex flex-wrap justify-center gap-4 grayscale opacity-50">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="Paypal" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}