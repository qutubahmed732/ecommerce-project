"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore"
import ProductCard from "@/components/ui/ProductCard"
import { PackageSearch, Loader2, ArrowLeft } from "lucide-react"

export default function AllProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Real-time query setup
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));

    // 2. Listener start (Client-side par gRPC error nahi aayega)
    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(docs);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore error:", error);
        setLoading(false);
      }
    );

    // 3. Cleanup on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Page Header */}
      <div className="bg-white border-b mb-10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <PackageSearch className="text-blue-600 w-8 h-8" />
            Explore All Products
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Browse through our extensive collection of products from verified vendors.
            Quality guaranteed.
          </p>
          <button onClick={() => window.history.back()} className="flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-800 font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6">
        {loading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="bg-slate-50 p-6 rounded-full mb-4">
              <PackageSearch className="w-12 h-12 text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">No products found</h2>
            <p className="text-slate-500">Check back later for new arrivals.</p>
          </div>
        ) : (
          // Products Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}