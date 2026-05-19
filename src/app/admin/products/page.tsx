import { adminDb } from "@/lib/firebaseAdmin";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { DeleteProductBtn } from "../delete-product-btn";

export default async function AdminProductsPage() {
    // 1. Fetching all products from all vendors
    const productsSnap = await adminDb.collection("products").orderBy("createdAt", "desc").get();
    const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(products);

    const productsWithVendor = await Promise.all(
        productsSnap.docs.map(async (productDoc) => {
            const productData = productDoc.data();
            let vendorName = "Unknown Vendor";

            if (productData.vendorId) {
                // Vendor ki ID se uski profile fetch karein
                const vendorDoc = await adminDb.collection("users").doc(productData.vendorId).get();
                if (vendorDoc.exists) {
                    vendorName = vendorDoc.data()?.name || "No Name";
                }
            }

            return {
                id: productDoc.id,
                ...productData,
                vendorDisplayName: vendorName
            };
        })
    );

    return (
        <div className="space-y-8">
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter">Product Moderation</h1>
                    <p className="text-slate-400 mt-2 font-medium">Monitor and manage all items across the marketplace.</p>
                </div>
                <ShieldCheck size={60} className="text-blue-500 opacity-50" />
            </div>
        
            <div className="bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow className="border-none">
                            <TableHead className="py-6 px-8 font-black uppercase text-xs">Product Details</TableHead>
                            <TableHead className="font-black uppercase text-xs">Vendor</TableHead>
                            <TableHead className="font-black uppercase text-xs">Price & Stock</TableHead>
                            <TableHead className="font-black uppercase text-xs text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {productsWithVendor.map((product: any) => (
                            <TableRow key={product.id} className="hover:bg-slate-50/50 transition-colors border-slate-100">
                                <TableCell className="py-6 px-8">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                                            <Image
                                                src={product.imageUrl || "/placeholder.png"}
                                                alt={product.name || " "}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-lg leading-tight">{product.name}</p>
                                            <p className="text-slate-400 text-xs font-bold uppercase mt-1">{product.category}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-blue-600">@{product.vendorDisplayName || "Unknown"}</span>
                                        <span className="text-[10px] text-slate-400 font-mono italic leading-none">{product.vendorId?.slice(0, 15)}...</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-black text-slate-900">${product.price}</span>
                                        <span className={`text-xs font-bold ${product.stock < 5 ? "text-red-500" : "text-slate-400"}`}>
                                            {product.stock} in stock
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right px-8">
                                    <div className="flex justify-end gap-3">
                                        <Button variant="outline" size="icon" className="rounded-xl border-slate-200 hover:bg-blue-50 hover:text-blue-600 transition-all">
                                            <ExternalLink size={18} />
                                        </Button>
                                        <DeleteProductBtn id={product.id} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}