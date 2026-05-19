"use client"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/useCartStore"
import { useAuthStore } from "@/store/useAuthStore"
import { ShoppingCart, Eye } from "lucide-react"

export default function ProductCard({ product }: { product: any }) {
  const addToCart = useCartStore((state) => state.addToCart)
  const { role } = useAuthStore()

  // Dynamic path generator
  // Agar aapne [id] folder hata diya hai, toh URL aise banega: /product?id=xyz
  const productPath = `/product?id=${product.id}`;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
      vendorId: product.vendorId,
      quantity: 1,
    })
  }

  return (
    <div className="group bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Image Section */}
      <Link href={productPath}>
        <div className="relative h-60 w-full overflow-hidden bg-slate-100 cursor-pointer">
          <Image
            src={product.imageUrl}
            alt={product.title}
            loading="eager"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <Link href={productPath} className="flex-1 truncate">
            <h3 className="font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer">
              {product.title}
            </h3>
          </Link>
          <span className="text-blue-600 font-black ml-2">${product.price}</span>
        </div>
        
        <p className="text-slate-500 text-xs line-clamp-2 mb-4 h-8">
          {product.description}
        </p>

        <div className="flex gap-2 mt-auto">
          <Link href={productPath} className="flex-1">
            <Button variant="outline" className="w-full h-9 text-xs font-semibold">
              <Eye className="w-4 h-4 mr-1" /> Details
            </Button>
          </Link>
          
          {role !== "VENDOR" && (
            <Button 
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="flex-1 h-9 text-xs font-semibold bg-blue-600 hover:bg-blue-700"
            >
              <ShoppingCart className="w-4 h-4 mr-1" /> Add
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}