"use client"

import Link from "next/link"
import { useAuthStore } from "@/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/useCartStore"
import { ShoppingBag, LayoutDashboard, LogOut, Store } from "lucide-react"
import { useEffect, useState } from "react"

export default function Navbar() {
  const { user, role, logout } = useAuthStore()
  const cartItems = useCartStore((state) => state.cart)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  const canShop = !user || role !== "VENDOR"

  if (!mounted) {
    return <div className="site-nav nav-placeholder" aria-hidden="true"><span className="nav-brand">QUTUB<span>.</span></span></div>
  }

  return (
    <nav className="site-nav" aria-label="Main navigation">
      <Link href="/" className="nav-brand" aria-label="Qutub Market home">QUTUB<span>.</span></Link>
      <div className="nav-center">
        {canShop && <Link href="/products"><Store size={15} /> The collection</Link>}
        <a href="/#featured">The latest</a>
      </div>
      <div className="nav-actions">
        {canShop && <Link href="/cart" className="nav-cart" aria-label={`Shopping bag, ${cartCount} items`}><ShoppingBag size={17} /><span>Bag</span>{cartCount > 0 && <b>{cartCount}</b>}</Link>}
        {user ? (
          <>
            <Link className="nav-account" href={role === "VENDOR" ? "/vendor-dashboard" : "/user-dashboard"}><LayoutDashboard size={16} /><span>{role === "VENDOR" ? "Studio" : "My orders"}</span></Link>
            <Button variant="ghost" size="sm" onClick={logout} className="nav-logout"><LogOut size={15} /><span>Sign out</span></Button>
          </>
        ) : (
          <>
            <Link href="/login" className="nav-login">Sign in</Link>
            <Link href="/register" className="nav-join">Join us <span>↗</span></Link>
          </>
        )}
      </div>
    </nav>
  )
}
