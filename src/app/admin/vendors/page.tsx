"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, Store } from "lucide-react";
import { toast } from "sonner";

export default function VendorManagement() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time Fetch Vendors
  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "VENDOR"));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const vendorList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVendors(vendorList);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const updateVendorStatus = async (vendorId: string, newStatus: string) => {
    try {
      const vendorRef = doc(db, "users", vendorId);
      await updateDoc(vendorRef, {
        status: newStatus // active, pending, or blocked
      });
      toast.success(`Vendor is now ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="p-10 font-bold animate-pulse text-slate-400 uppercase tracking-widest text-center">Fetching Shop Requests...</div>;

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 italic">Vendor Requests</h2>
          <p className="text-slate-500 font-medium">Verify and manage sellers on your platform.</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-2xl">
          <Store className="text-blue-600" size={32} />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="font-black uppercase text-xs py-6">Shop Name / Email</TableHead>
              <TableHead className="font-black uppercase text-xs">Status</TableHead>
              <TableHead className="font-black uppercase text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-20 text-slate-400 italic">No vendor applications found.</TableCell>
              </TableRow>
            ) : (
              vendors.map((vendor) => (
                <TableRow key={vendor.id} className="hover:bg-slate-50/50 transition-colors border-slate-100">
                  <TableCell className="py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 text-lg">{vendor.displayName || "New Shop"}</span>
                      <span className="text-slate-400 text-sm font-medium">{vendor.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {vendor.status === "active" ? (
                      <Badge className="bg-green-100 text-green-600 hover:bg-green-100 border-none px-4 py-1 rounded-full"><CheckCircle size={12} className="mr-1" /> Active</Badge>
                    ) : vendor.status === "blocked" ? (
                      <Badge className="bg-red-100 text-red-600 hover:bg-red-100 border-none px-4 py-1 rounded-full"><XCircle size={12} className="mr-1" /> Blocked</Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 border-none px-4 py-1 rounded-full"><Clock size={12} className="mr-1" /> Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {vendor.status !== "active" && (
                        <Button 
                          onClick={() => updateVendorStatus(vendor.id, "active")}
                          variant="outline" 
                          className="border-green-200 text-green-600 hover:bg-green-50 rounded-xl font-bold"
                        >
                          Approve
                        </Button>
                      )}
                      {vendor.status !== "blocked" && (
                        <Button 
                          onClick={() => updateVendorStatus(vendor.id, "blocked")}
                          variant="ghost" 
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold"
                        >
                          Block
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}