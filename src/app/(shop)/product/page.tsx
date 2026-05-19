"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, onSnapshot, orderBy, addDoc } from "firebase/firestore";
import Image from "next/image";
import { notFound, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart, ShieldCheck, Truck, RotateCcw, CheckCircle2, Minus, Plus, Star } from "lucide-react";

// Store Imports
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";

export default function ProductDetailsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProductDetails />
    </Suspense>
  );
}

function ProductDetails() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  // Global Stores
  const { addToCart, cart } = useCartStore();
  const { user, role } = useAuthStore();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // --- Reviews States ---
  const [reviews, setReviews] = useState<any[]>([]);
  const [userRating, setUserRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Sync quantity with Cart
  useEffect(() => {
    if (id && cart.length > 0) {
      const existingItem = cart.find((item) => item.id === id);
      if (existingItem) setQuantity(existingItem.quantity);
    }
  }, [id, cart]);

  // Fetch Product & Real-time Reviews
  useEffect(() => {
    async function fetchProduct() {
      if (!id) { setLoading(false); return; }
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setProduct({ id: docSnap.id, ...docSnap.data() });
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }

    const fetchReviews = () => {
      if (!id) return;
      const q = query(collection(db, "reviews"), where("productId", "==", id), orderBy("createdAt", "desc"));
      return onSnapshot(q, (snapshot) => {
        setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    };

    fetchProduct();
    const unsubReviews = fetchReviews();
    return () => unsubReviews && unsubReviews();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: product.stock,
        vendorId: product.vendorId,
        quantity: quantity,
      });
      setIsAdded(true);
      setTimeout(() => router.back(), 1200);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Please login first");
    if (!comment.trim()) return alert("Write something!");

    setIsSubmittingReview(true);
    try {
      await addDoc(collection(db, "reviews"), {
        productId: id,
        userId: user.uid,
        userName: user.displayName || user.email?.split("@")[0],
        rating: userRating,
        comment: comment,
        createdAt: new Date().toISOString(),
      });
      setComment("");
      setUserRating(5);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!product) return notFound();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-6xl mx-auto px-4 pt-8 md:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* IMAGE SECTION */}
          <div className="lg:sticky lg:top-24">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-2xl border border-slate-100 group">
              <Image src={product.imageUrl} alt={product.title} fill className="object-contain p-8 group-hover:scale-105 transition-transform duration-500" />
              {product.stock <= 0 && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                  <Badge variant="destructive" className="text-xl px-8 py-3 uppercase">Sold Out</Badge>
                </div>
              )}
            </div>
          </div>

          {/* INFO SECTION */}
          <div className="flex flex-col space-y-8">
            <div className="space-y-4">
              <Badge className="bg-blue-600 text-white hover:bg-blue-700 uppercase tracking-widest px-4 py-1">{product.category}</Badge>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">{product.title}</h1>
              <div className="flex items-center gap-4">
                <span className="text-5xl font-black text-blue-600">${product.price}</span>
                {product.stock > 0 && <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">{product.stock} in stock</Badge>}
              </div>
            </div>

            <p className="text-slate-600 text-lg leading-relaxed bg-white p-6 rounded-2xl shadow-sm border-l-8 border-blue-600">
              {product.description || "Premium quality product from our verified vendors."}
            </p>

            {/* Qty & Add to Cart */}
            {product.stock > 0 && role !== "VENDOR" && (
              <div className="flex flex-col sm:flex-row gap-6 items-center pt-4">
                <div className="flex items-center border-2 border-slate-200 rounded-2xl bg-white shadow-sm h-16 px-2">
                  <button onClick={() => quantity > 1 && setQuantity(q => q - 1)} className="p-3 hover:text-blue-600 transition-colors"><Minus size={20} /></button>
                  <span className="w-12 text-center font-black text-2xl">{quantity}</span>
                  <button onClick={() => quantity < product.stock && setQuantity(q => q + 1)} className="p-3 hover:text-blue-600 transition-colors"><Plus size={20} /></button>
                </div>
                <Button onClick={handleAddToCart} size="lg" disabled={isAdded} className={`flex-1 h-16 text-xl font-bold rounded-2xl shadow-xl transition-all active:scale-95 ${isAdded ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"}`}>
                  {isAdded ? <><CheckCircle2 className="mr-2" /> Done!</> : <><ShoppingCart className="mr-2" /> Add to Cart</>}
                </Button>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 py-6 border-y border-slate-200">
              <Feature icon={<Truck />} text="Fast Delivery" />
              <Feature icon={<ShieldCheck />} text="Secure Pay" />
              <Feature icon={<RotateCcw />} text="Easy Return" />
            </div>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div className="mt-32 grid grid-cols-1 lg:grid-cols-3 gap-16 border-t pt-20">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
              <h3 className="text-2xl font-black mb-2">Review this item</h3>
              <p className="text-slate-400 text-sm mb-8">Share your experience with others.</p>
              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-6">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} type="button" onClick={() => setUserRating(s)} className="transition-transform active:scale-125">
                        <Star size={32} className={s <= userRating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"} />
                      </button>
                    ))}
                  </div>
                  <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="What's on your mind?" className="w-full p-5 rounded-2xl bg-slate-50 border-none min-h-[150px] outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" />
                  <Button disabled={isSubmittingReview} className="w-full h-14 bg-slate-900 rounded-2xl font-bold text-lg">
                    {isSubmittingReview ? "Posting..." : "Post Review"}
                  </Button>
                </form>
              ) : (
                <Button onClick={() => router.push("/login")} className="w-full bg-blue-600 py-8 text-lg font-bold rounded-2xl">Login to Review</Button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-2 space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-black">Customer Reviews</h2>
              <Badge className="bg-blue-50 text-blue-600 border-blue-100">{reviews.length} total</Badge>
            </div>

            {reviews.length === 0 ? (
              <div className="bg-white p-20 rounded-3xl border-4 border-dashed border-slate-100 text-center">
                <p className="text-slate-400 text-xl italic font-medium">No reviews yet. Be the first!</p>
              </div>
            ) : (
              <div className="grid gap-8">
                {reviews.map(rev => (
                  <div key={rev.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-50 hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                          {rev.userName?.[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-xl text-slate-900 leading-none mb-1">{rev.userName}</p>
                          <div className="flex gap-0.5 mt-2">
                            {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < rev.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"} />)}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-tighter">{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ""}</span>
                    </div>
                    <p className="text-slate-600 text-lg bg-slate-50/50 p-6 rounded-2xl italic leading-relaxed">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, text }: any) {
  return (
    <div className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-100 text-center">
      <div className="text-blue-600">{icon}</div>
      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{text}</span>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="w-16 h-16 animate-spin text-blue-600 mb-4" />
      <p className="text-slate-500 font-bold tracking-tighter uppercase">Loading Product Experience...</p>
    </div>
  );
}