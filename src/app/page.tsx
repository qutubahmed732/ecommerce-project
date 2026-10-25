"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { collection, onSnapshot, orderBy, query } from "firebase/firestore"
import { ArrowDownRight, ArrowRight, Check, LoaderCircle, MoveUpRight, PackageOpen, Sparkles } from "lucide-react"
import Navbar from "@/components/ui/Navbar"
import { db } from "@/lib/firebase"
import { useAuthStore } from "@/store/useAuthStore"
import { useCartStore } from "@/store/useCartStore"

type Product = {
  id: string
  title: string
  category?: string
  price: number
  imageUrl: string
  stock: number
  vendorId?: string
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [booting, setBooting] = useState(true)
  const [error, setError] = useState(false)
  const [addedId, setAddedId] = useState<string | null>(null)
  const { user, role } = useAuthStore()
  const cart = useCartStore((state) => state.cart)
  const addToCart = useCartStore((state) => state.addToCart)

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 1050)
    const productsQuery = query(collection(db, "products"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        setProducts(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Product))
        setLoading(false)
      },
      (loadError) => {
        console.error("Could not load products:", loadError)
        setError(true)
        setLoading(false)
      },
    )

    return () => {
      window.clearTimeout(timer)
      unsubscribe()
    }
  }, [])

  const handleAdd = (product: Product) => {
    const existing = cart.find((item) => item.id === product.id)
    addToCart({
      ...product,
      vendorId: product.vendorId || "unknown_vendor",
      quantity: existing ? existing.quantity + 1 : 1,
    })
    setAddedId(product.id)
    window.setTimeout(() => setAddedId(null), 1400)
  }

  return (
    <div className="storefront">
      {booting && (
        <div className="intro-loader" role="status" aria-label="Loading Qutub Market">
          <div className="loader-mark">Q<span>.</span></div>
          <div className="loader-track"><span /></div>
          <p>MADE FOR THE EVERYDAY</p>
        </div>
      )}

      <Navbar />
      <main>
        <section className="hero-shell">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-line" /> THE CONSIDERED MARKETPLACE</span>
            <h1>Good things.<br /><em>Found here.</em></h1>
            <p>Thoughtful finds from independent makers and trusted shops. A little more meaning in every order.</p>
            <div className="hero-actions">
              <Link className="button-dark" href="/products">Explore the collection <ArrowRight size={16} /></Link>
              <a className="text-link" href="#featured">Discover the edit <ArrowDownRight size={16} /></a>
            </div>
            <div className="hero-note"><span className="note-stars">★★★★★</span><span>Small shops. Standout finds.</span></div>
          </div>
          <div className="hero-art" role="img" aria-label="Sculptural ceramic pieces in warm afternoon light">
            <div className="art-caption"><span>THE OBJECT EDIT</span><span>VOL. 01 / 2026</span></div>
            <div className="art-seal"><Sparkles size={17} /><span>Curated<br />with care</span></div>
          </div>
          <div className="hero-index">01 <span /> 03</div>
        </section>

        <section className="promise-strip" aria-label="Shopping benefits">
          <div><span className="promise-number">01</span><span>Independent sellers</span></div>
          <div><span className="promise-number">02</span><span>Chosen with intention</span></div>
          <div><span className="promise-number">03</span><span>Secure checkout, always</span></div>
        </section>

        <section className="featured-section" id="featured">
          <div className="section-heading">
            <div><span className="eyebrow"><span className="eyebrow-line" /> THE LATEST FINDS</span><h2>A good place to start.</h2></div>
            <Link className="text-link section-link" href="/products">View everything <MoveUpRight size={15} /></Link>
          </div>

          {loading ? (
            <div className="product-loading" aria-live="polite"><LoaderCircle className="loading-icon" size={23} /><span>Gathering the latest finds</span></div>
          ) : error ? (
            <div className="product-empty"><PackageOpen size={26} /><p>We couldn’t load the collection just now.</p><Link href="/products">Try the full collection <ArrowRight size={15} /></Link></div>
          ) : products.length === 0 ? (
            <div className="product-empty"><PackageOpen size={26} /><p>New finds are on their way.</p><span>Check back soon for the latest from our sellers.</span></div>
          ) : (
            <div className="product-grid">
              {products.slice(0, 4).map((product, index) => (
                <article className="product-tile" key={product.id}>
                  <Link className="product-image" href={`/product?id=${product.id}`} aria-label={`View ${product.title}`}>
                    {product.imageUrl ? <Image src={product.imageUrl} alt={product.title} fill sizes="(max-width: 640px) 90vw, (max-width: 1024px) 44vw, 22vw" priority={index < 2} /> : <div className="image-placeholder"><Sparkles size={24} /></div>}
                    <span className="product-number">0{index + 1}</span>
                    {product.stock <= 0 && <span className="stock-ribbon">SOLD OUT</span>}
                  </Link>
                  <div className="product-info">
                    <div className="product-meta"><span>{product.category || "THE EDIT"}</span><span>{product.stock > 0 ? "IN STOCK" : "UNAVAILABLE"}</span></div>
                    <div className="product-title-row"><Link href={`/product?id=${product.id}`}><h3>{product.title}</h3></Link><span className="product-price">${Number(product.price || 0).toLocaleString()}</span></div>
                    {user && role === "USER" ? (
                      <button className="product-add" onClick={() => handleAdd(product)} disabled={product.stock <= 0}>
                        {addedId === product.id ? <><Check size={15} /> Added to bag</> : product.stock > 0 ? <>Add to bag <ArrowRight size={15} /></> : "Currently unavailable"}
                      </button>
                    ) : !user ? (
                      <Link className="product-add" href="/login">Sign in to shop <ArrowRight size={15} /></Link>
                    ) : <span className="product-add vendor-note">Vendor preview</span>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="editorial-banner">
          <div className="editorial-image" role="img" aria-label="Warmly lit, carefully arranged objects" />
          <div className="editorial-copy"><span className="eyebrow"><span className="eyebrow-line" /> A BETTER WAY TO BROWSE</span><h2>Less scrolling.<br /><em>More discovering.</em></h2><p>Meet the people behind the products and find something that feels like you.</p><Link className="button-dark" href="/products">Meet the marketplace <ArrowRight size={16} /></Link></div>
          <span className="editorial-side-label">GOOD THINGS, FOUND HERE — QUTUB MARKET</span>
        </section>

        <footer className="store-footer"><Link href="/" className="footer-brand">QUTUB<span>.</span></Link><span>Independent finds, thoughtfully gathered.</span><Link href="/products">Shop the collection <ArrowRight size={14} /></Link><span className="footer-year">© 2026</span></footer>
      </main>
    </div>
  )
}
