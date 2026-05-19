"use client"
import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore"
import Navbar from "@/components/ui/Navbar"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/useCartStore"
import { useAuthStore } from "@/store/useAuthStore" // Auth store import kiya
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Home() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Stores se data nikalna
  const { cart, addToCart } = useCartStore();
  const { user, role } = useAuthStore()

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);


  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="bg-blue-600 text-white py-20 px-10 text-center">
        <h1 className="text-5xl font-bold mb-4">Discover Amazing Products</h1>
        <p className="text-xl opacity-90">Multi-vendor platform for everyone.</p>
      </section>

      <main className="max-w-7xl mx-auto py-12 px-6">
        <h2 className="text-3xl font-bold mb-8">Featured Products</h2>

        {loading ? (
          <div className="text-center py-20">Loading amazing deals...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden p-0 hover:shadow-xl transition-all cursor-pointer border-none shadow-md"
              >
                <div className="relative h-46 w-full">
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <CardHeader className="p-4">
                  <CardTitle className="text-xl truncate">{product.title}</CardTitle>
                  <p className="text-sm text-slate-500 capitalize">{product.category}</p>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">${product.price}</span>

                    {user && role === "USER" ? (
                      <Button
                        size="sm"
                        disabled={product.stock <= 0}
                        onClick={() => {
                          const isInCart = cart.find((item) => item.id === product.id);
                          isInCart ? addToCart({ ...product, id: product.id, quantity: isInCart.quantity + 1 }) :
                            addToCart({
                              id: product.id,
                              title: product.title,
                              price: product.price,
                              imageUrl: product.imageUrl,
                              stock: product.stock,
                              vendorId: product.vendorId || "unknown_vendor",
                              quantity: Number(1),
                            });
                        }}
                      >
                        {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                      </Button>
                    ) : !user ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          router.push("/login");
                        }}
                      >
                        Login to Buy
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium italic">Viewing as Vendor</span>
                    )}
                  </div>

                  <p className={`text-xs mt-2 ${product.stock < 5 ? "text-red-500 font-semibold" : "text-green-600"}`}>
                    {product.stock > 0 ? `Only ${product.stock} left!` : "Unavailable"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}