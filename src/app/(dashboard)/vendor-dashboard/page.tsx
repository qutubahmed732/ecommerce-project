"use client"
import { useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, deleteDoc } from "firebase/firestore"
import { useAuthStore } from "@/store/useAuthStore"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import Image from "next/image"
import { LayoutDashboard, PlusCircle, Package, DollarSign, ShoppingBag, CheckCircle2, Truck, Trash2, Edit3, ImagePlus } from "lucide-react"

export default function VendorDashboard() {
  const { user, role, loading: authLoading } = useAuthStore()
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 🔹 Edit Modal States
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editPrice, setEditPrice] = useState(0)
  const [editStock, setEditStock] = useState(0)
  const [editImage, setEditImage] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string>("")
  const [editLoading, setEditLoading] = useState(false)

  // 1. Auth Guard
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login")
      } else if (role !== "VENDOR") {
        router.push("/")
      }
    }
  }, [user, role, authLoading, router])

  // 2. Real-time Snapshot Subscriptions
  useEffect(() => {
    if (!user || role !== "VENDOR") return;

    const qProducts = query(
      collection(db, "products"),
      where("vendorId", "==", user.uid)
    );

    const qOrders = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const vendorSpecificOrders = allOrders.filter((order: any) =>
        order.items?.some((item: any) => item.vendorId === user.uid)
      );
      setOrders(vendorSpecificOrders);
    });

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, [user, role]);

  // 3. Order Status Update
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (error) {
      console.error("Status Update Failed:", error);
      alert("Failed to update status");
    }
  };

  // 4. Open Edit Modal with Product Data
  const openEditModal = (product: any) => {
    setEditingProduct(product)
    setEditTitle(product.title)
    setEditPrice(product.price)
    setEditStock(product.stock)
    setEditImagePreview(product.imageUrl || "")
    setEditImage(null)
    setIsEditOpen(true)
  }

  // Handle local image selection for preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEditImage(file)
      setEditImagePreview(URL.createObjectURL(file))
    }
  }

  // 5. Submit Edited Product to Cloudinary and Firestore
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    setEditLoading(true)
    let finalImageUrl = editingProduct.imageUrl

    try {
      if (editImage) {
        const formData = new FormData()
        formData.append("file", editImage)
        formData.append("upload_preset", "internee_ecommerce") 
        
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        })
        
        const data = await res.json()
        if (data.secure_url) {
          finalImageUrl = data.secure_url
        } else {
          throw new Error("Cloudinary upload failed")
        }
      }

      const productRef = doc(db, "products", editingProduct.id)
      await updateDoc(productRef, {
        title: editTitle,
        price: Number(editPrice),
        stock: Number(editStock),
        imageUrl: finalImageUrl,
      })
      
      setIsEditOpen(false)
      setEditingProduct(null)
      alert("Product updated successfully!")
    } catch (error) {
      console.error("Update Product Error:", error)
      alert("Failed to update product")
    } finally {
      setEditLoading(false)
    }
  }

  // 6. Delete Product
  const handleDeleteProduct = async (productId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "products", productId));
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete product.");
    }
  };

  // 7. Revenue Calculation
  const totalRevenue = orders.reduce((acc, order) => {
    if (!user) return 0;
    const vendorItems = order.items.filter((item: any) => item.vendorId === user.uid);
    const orderTotal = vendorItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    return acc + orderTotal;
  }, 0);

  if (authLoading || (loading && !products.length)) {
    return <div className="h-screen flex items-center justify-center font-medium">Loading Dashboard...</div>
  }

  return (
    <div className="min-h-screen bg-transparent">
      <main className="max-w-7xl mx-auto py-10 px-4 md:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-2 text-slate-900 tracking-tight">
              <LayoutDashboard className="text-blue-600 h-7 w-7" /> Vendor Panel
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Manage your shop, sales and orders.</p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm px-5 py-5 font-bold transition-all text-sm w-full sm:w-auto"
            onClick={() => router.push("/vendor-dashboard/add-product")}
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Add Product
          </Button>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="border-none shadow-sm rounded-2xl bg-white"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 bg-blue-50 rounded-xl"><Package className="h-6 w-6 text-blue-600" /></div><div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory</p><p className="text-2xl font-black text-slate-900">{products.length}</p></div></div></CardContent></Card>
          <Card className="border-none shadow-sm rounded-2xl bg-white"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 bg-orange-50 rounded-xl"><ShoppingBag className="h-6 w-6 text-orange-500" /></div><div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</p><p className="text-2xl font-black text-slate-900">{orders.length}</p></div></div></CardContent></Card>
          <Card className="border-none shadow-sm rounded-2xl bg-white"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 bg-emerald-50 rounded-xl"><DollarSign className="h-6 w-6 text-emerald-600" /></div><div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue</p><p className="text-2xl font-black text-slate-900">${totalRevenue.toFixed(2)}</p></div></div></CardContent></Card>
        </div>

        {/* Order Management Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-12">
          <div className="p-6 border-b border-slate-100"><h2 className="text-lg font-black text-slate-900">Recent Customer Orders</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/70 border-b border-slate-100">
                <tr>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Order Details</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Earnings</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {user && orders.map((order) => {
                  const myItems = order.items.filter((i: any) => i.vendorId === user.uid);
                  const myTotal = myItems.reduce((s: number, i: any) => s + (i.price * i.quantity), 0);
                  return (
                    <tr key={order.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40 transition-colors">
                      <td className="p-4">
                        <p className="text-sm font-black text-slate-800 uppercase">#{order.id.slice(-6)}</p>
                        <p className="text-xs font-medium text-slate-400">{myItems.length} items from your shop</p>
                      </td>
                      <td className="p-4 text-sm font-extrabold text-emerald-600">${myTotal.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {(order.status === "paid" || order.status === "pending") && (
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 font-semibold"
                            onClick={() => updateOrderStatus(order.id, "shipped")}
                          >
                            <Truck className="h-3.5 w-3.5 mr-1.5" /> Ship Item
                          </Button>
                        )}

                        {order.status === "shipped" && (
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 font-semibold"
                            onClick={() => updateOrderStatus(order.id, "delivered")}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Mark Delivered
                          </Button>
                        )}

                        {order.status === "delivered" && (
                          <span className="text-xs text-slate-400 font-bold italic bg-slate-100 px-2.5 py-1 rounded-lg">Completed</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="mb-6"><h2 className="text-xl font-black text-slate-900">Your Products</h2></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all rounded-2xl bg-white group">
              <div className="relative h-48 w-full bg-slate-100">
                <Image src={product.imageUrl || "/placeholder.png"} loading="eager" alt={product.title} fill className="object-cover" />
              </div>
              <CardHeader className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-sm font-bold text-slate-800 line-clamp-1">{product.title}</CardTitle>
                  <span className="text-sm font-extrabold text-blue-600">${product.price}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className={`text-xs font-bold ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {product.stock} in stock
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-[11px] px-2.5 font-bold flex items-center gap-1 border-slate-200 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={() => openEditModal(product)}
                    >
                      <Edit3 size={12} /> Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>

      {/* 🔹 Edit Dialog Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[20px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900">Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProduct} className="space-y-4 pt-2">
            
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-3 bg-slate-50 relative group">
              {editImagePreview ? (
                <div className="relative w-full h-36 rounded-xl overflow-hidden">
                  <Image src={editImagePreview} alt="Preview" fill className="object-cover" />
                  <label htmlFor="edit-image-file" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold gap-1">
                    <ImagePlus size={16} /> Change Image
                  </label>
                </div>
              ) : (
                <label htmlFor="edit-image-file" className="flex flex-col items-center justify-center py-6 cursor-pointer text-slate-400 hover:text-blue-600 transition-colors">
                  <ImagePlus size={32} className="mb-1" />
                  <span className="text-xs font-bold">Upload Image</span>
                </label>
              )}
              <input 
                id="edit-image-file"
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageChange}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Title</label>
              <Input 
                value={editTitle} 
                onChange={(e) => setEditTitle(e.target.value)} 
                className="rounded-xl"
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price ($)</label>
                <Input 
                  type="number" 
                  value={editPrice} 
                  className="rounded-xl"
                  onChange={(e) => setEditPrice(Number(e.target.value))} 
                  required 
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Quantity</label>
                <Input 
                  type="number" 
                  value={editStock} 
                  className="rounded-xl"
                  onChange={(e) => setEditStock(Number(e.target.value))} 
                  required 
                  min="0"
                />
              </div>
            </div>
            <DialogFooter className="pt-4 gap-2">
              <Button 
                type="button" 
                variant="outline" 
                className="rounded-xl font-bold"
                onClick={() => setIsEditOpen(false)}
                disabled={editLoading}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold" disabled={editLoading}>
                {editLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}