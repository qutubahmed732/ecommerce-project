"use client"
import { useState } from "react"
import { db } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"
import { useAuthStore } from "@/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Navbar from "@/components/ui/Navbar"
import { ArrowLeft, PackagePlus } from "lucide-react"

export default function AddProductPage() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    stock: "",
    category: ""
  })
  const router = useRouter();

  const handleUpload = async () => {
    // Basic Validation
    if (!formData.title || !formData.price || !formData.stock || !file) {
      return alert("Bhai, saari fields fill karein aur image select karein!");
    }

    if (!user) return alert("Session expired. Please login again.");
    
    setLoading(true);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "internee_ecommerce");

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: data }
      );

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error?.message || "Cloudinary upload failed");
      }

      const imageUrl = resData.secure_url;

      // Firebase save logic with vendorId
      await addDoc(collection(db, "products"), {
        title: formData.title,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        imageUrl: imageUrl,
        vendorId: user.uid, // Dashboard isi ID se products filter karega
        createdAt: new Date().toISOString(),
      });

      alert("Zabardast! Product add ho gaya.");
      router.push("/vendor-dashboard"); 
    } catch (error: any) {
      console.error("Final Error:", error);
      alert(`Masla aa gaya: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="p-6 md:p-10 max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6 hover:bg-slate-200"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <Card className="border-none shadow-lg">
          <CardHeader className="border-b bg-white rounded-t-xl">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <PackagePlus className="text-blue-600" /> Add New Product
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-5 pt-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Product Title</label>
              <Input 
                placeholder="e.g. Wireless Headphones" 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Price ($)</label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Stock Quantity</label>
                <Input 
                  type="number" 
                  placeholder="10" 
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Category</label>
              <Input 
                placeholder="Electronics, Fashion, etc." 
                onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Product Image</label>
              <div className="border-2 border-dashed border-slate-200 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <Input 
                  type="file" 
                  className="cursor-pointer border-none shadow-none bg-transparent" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)} 
                />
              </div>
            </div>

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-bold transition-all shadow-md active:scale-[0.98]" 
              onClick={handleUpload} 
              disabled={loading}
            >
              {loading ? "Saving Product..." : "Launch Product"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}