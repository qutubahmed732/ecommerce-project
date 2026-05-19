"use client"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore"
import { useRouter } from "next/navigation"
import Navbar from "@/components/ui/Navbar"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Package, Clock, CheckCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UserDashboard() {
  const { user, role, loading: authLoading } = useAuthStore()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login")
      } else if (role !== "USER") {
        router.push("/")
      }
    }
  }, [user, role, authLoading, router])

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (authLoading || loading) {
    return <div className="flex h-screen items-center justify-center font-medium">Loading Dashboard...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto py-12 px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="text-slate-500">Manage and track your recent purchases</p>
          </div>
          <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
            {user?.email}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Spent</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                ${orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Orders</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {orders.filter(o => o.status === "pending" || o.status === "shipped").length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {orders.filter(o => o.status === "delivered").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center">
              <Package size={48} className="text-slate-300 mb-4" />
              <p className="text-slate-500 text-lg font-medium">No orders found.</p>
              <Button className="mt-4 bg-blue-600" onClick={() => router.push("/")}>Start Shopping</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-4 font-semibold text-sm">Order ID</th>
                    <th className="p-4 font-semibold text-sm">Date</th>
                    <th className="p-4 font-semibold text-sm">Total</th>
                    <th className="p-4 font-semibold text-sm">Status</th>
                    <th className="p-4 font-semibold text-sm text-right">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-sm font-mono font-medium text-blue-600 uppercase">
                        #{order.id.slice(-6)}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="p-4 text-sm font-bold text-slate-900">
                        ${Number(order.totalAmount).toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                              'bg-emerald-100 text-emerald-700'
                          }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ExternalLink size={16} className="text-slate-400" />
                        </Button>
                      </td>
                      {/* Actions Column mein delivered status ke liye button */}
                      <td className="p-4 text-right">
                        {order.status === "delivered" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-green-600 text-green-600 hover:bg-green-50"
                            onClick={() => {/* Yahan Review Modal khulega */ }}
                          >
                            Write Review
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ExternalLink size={16} className="text-slate-400" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}