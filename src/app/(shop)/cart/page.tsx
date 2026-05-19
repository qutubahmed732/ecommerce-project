"use client"
import { useCartStore } from "@/store/useCartStore"
import { useAuthStore } from "@/store/useAuthStore" // Role check ke liye
import Navbar from "@/components/ui/Navbar"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function CartPage() {
  const { cart, removeFromCart, addToCart, clearCart, decreaseQuantity } = useCartStore()
  const { role } = useAuthStore() // Get user role
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

  // Professional Loading State
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto py-12 px-6">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="text-blue-600 w-8 h-8" />
          <h1 className="text-3xl font-bold text-slate-900">Your Shopping Cart</h1>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-slate-100">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="text-slate-300 w-10 h-10" />
            </div>
            <p className="text-xl text-slate-500 mb-8 font-medium">Your cart feels a bit light!</p>
            <Link href="/">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 h-12 rounded-xl">
                Explore Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {cart.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between p-6 border-b last:border-0 gap-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-5 w-full sm:w-auto">
                      <div className="relative h-24 w-24 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden border border-slate-50">
                        <Image 
                          src={item.imageUrl} 
                          alt={item.title} 
                          fill 
                          className="object-contain p-2" 
                        />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-bold text-lg text-slate-800 leading-tight line-clamp-1">{item.title}</h3>
                        <p className="text-blue-600 font-black text-xl mt-1">${item.price}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`h-2 w-2 rounded-full ${item.stock > 5 ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">In Stock: {item.stock}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-8">
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-slate-100 text-slate-600 rounded-lg"
                          onClick={() => decreaseQuantity(item.id)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </Button>

                        <span className="w-10 text-center font-bold text-slate-800 text-sm">
                          {item.quantity}
                        </span>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-slate-100 text-slate-600 rounded-lg"
                          onClick={() => addToCart(item)}
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus size={14} />
                        </Button>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block min-w-[80px]">
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Subtotal</p>
                          <p className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                variant="ghost" 
                className="text-slate-400 hover:text-red-500 text-xs font-bold uppercase tracking-widest"
                onClick={clearCart}
              >
                Clear Entire Cart
              </Button>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 sticky top-24">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-slate-500">
                    <span>Items Total</span>
                    <span className="font-semibold text-slate-900">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Shipping</span>
                    <span className="text-green-600 font-bold uppercase text-xs">Free</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between">
                    <span className="text-lg font-bold">Total Amount</span>
                    <span className="text-2xl font-black text-blue-600">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {role === "VENDOR" ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs text-center font-medium leading-relaxed">
                    Vendors are not allowed to place orders. Please use a Customer account to shop.
                  </div>
                ) : (
                  <Link href="/checkout">
                    <Button className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 rounded-2xl group transition-all">
                      Checkout 
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                )}

                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Loader2 className="w-3 h-3" /> Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}