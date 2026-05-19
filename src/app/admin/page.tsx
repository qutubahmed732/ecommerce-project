import { adminDb } from "@/lib/firebaseAdmin";
import { DollarSign, Users, ShoppingBag, Store } from "lucide-react";

export default async function AdminDashboard() {
  // 1. Parallel Fetching (Fastest backend pipeline speed)
  const [usersSnap, productsSnap, ordersSnap, vendorsSnap] = await Promise.all([
    adminDb.collection("users").where("role", "==", "USER").count().get(),
    adminDb.collection("products").count().get(),
    adminDb.collection("orders").get(),
    adminDb.collection("users").where("role", "==", "VENDOR").count().get(),
  ]);

  // 2. Revenue Calculation
  let totalRevenue = 0;
  ordersSnap.docs.forEach(doc => {
    totalRevenue += doc.data().totalAmount || 0;
  });

  const stats = [
    { title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { title: "Active Customers", value: usersSnap.data().count, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Total Vendors", value: vendorsSnap.data().count, icon: Store, color: "text-orange-600", bg: "bg-orange-50" },
    { title: "Platform Sales", value: ordersSnap.size, icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in duration-500">
      {/* 🔹 Stat Cards Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">{stat.title}</p>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 mt-1 tracking-tight break-all">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* 🔹 Streams and System Health Activity Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Recent Orders List Preview Component */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-6 italic tracking-tight">Global Order Stream</h2>
          <div className="space-y-4">
            {ordersSnap.docs.slice(0, 5).map(order => (
              <div key={order.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100/60 gap-4">
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-800 text-sm truncate">Order #{order.id.slice(0,8)}</p>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                    {order.data().createdAt?.seconds 
                      ? new Date(order.data().createdAt.seconds * 1000).toLocaleDateString() 
                      : 'N/A'}
                  </p>
                </div>
                <span className="font-black text-blue-600 text-sm whitespace-nowrap">${order.data().totalAmount}</span>
              </div>
            ))}
            {ordersSnap.size === 0 && (
              <p className="text-sm font-medium text-slate-400 text-center py-6">No recent orders found.</p>
            )}
          </div>
        </div>

        {/* System Health Module */}
        <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-xl text-white flex flex-col justify-between min-h-[250px]">
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight mb-6">System Health</h2>
            <div className="space-y-4">
               <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-slate-400 text-xs md:text-sm font-bold">Server Engine:</span>
                  <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-lg text-[10px] font-black tracking-wider">OPERATIONAL</span>
               </div>
               <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-slate-400 text-xs md:text-sm font-bold">Database Instance:</span>
                  <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-lg text-[10px] font-black tracking-wider">CONNECTED</span>
               </div>
            </div>
          </div>
          
          <div className="pt-4 text-[11px] font-medium text-slate-500 border-t border-slate-800 uppercase tracking-widest text-center lg:text-left">
            Platform Monitored Live
          </div>
        </div>
      </div>
    </div>
  );
}