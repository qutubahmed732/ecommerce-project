"use client"
import Link from "next/link"
import { useAuthStore } from "@/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/useCartStore"
import { ShoppingCart, LayoutDashboard, LogOut, Store } from "lucide-react";
import { useEffect, useState } from "react"

export default function Navbar() {
  const { user, role, logout } = useAuthStore()
  const cartItems = useCartStore((state) => state.cart)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, []);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  if (!mounted) return null;

  const showCart = !user || (user && role !== "VENDOR");

  return (
    <nav className="flex justify-between items-center py-4 px-6 md:px-10 bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">
          MultiVendor
        </Link>

        {/* Shop Link for Guests/Customers */}
        {(!user || (user && role !== "VENDOR")) && (
          <Link
            href="/products"
            className="hidden md:flex items-center gap-2 font-medium text-slate-600 hover:text-blue-600 transition-colors text-sm"
          >
            <Store size={18} />
            Shop
          </Link>
        )}
      </div>

      <div className="flex gap-4 md:gap-6 items-center">
        {/* Mobile Shop Icon */}
        {(!user || (user && role !== "VENDOR")) && (
          <Link href="/products" className="md:hidden text-slate-600 hover:text-blue-600">
            <Store size={22} />
          </Link>
        )}

        {/* Conditional Cart Link */}
        {showCart && (
          <Link href="/cart" className="relative flex items-center gap-2 hover:text-blue-600 transition-colors">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-in zoom-in">
                {cartCount}
              </span>
            )}
            <span className="hidden sm:inline font-medium text-sm">Cart</span>
          </Link>
        )}

        {user ? (
          <>
            {/* Dashboard Link */}
            <Link
              href={role === "VENDOR" ? "/vendor-dashboard" : "/user-dashboard"}
              className="flex items-center gap-2 font-medium hover:text-blue-600 text-sm"
            >
              <LayoutDashboard size={20} />
              <span className="hidden sm:inline">
                {role === "VENDOR" ? "Vendor Panel" : "My Orders"}
              </span>
            </Link>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 h-9 px-3"
            >
              <LogOut size={18} className="sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </>
        ) : (
          /* Guest Links */
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-medium text-sm">Login</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 font-medium px-4 md:px-6 rounded-full text-sm">
                Join Now
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}