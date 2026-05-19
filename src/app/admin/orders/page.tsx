import { adminDb } from "@/lib/firebaseAdmin";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function AdminOrdersPage() {
  // Global orders fetch karna (Server-side)
  const ordersSnap = await adminDb.collection("orders").orderBy("createdAt", "desc").get();
  const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black italic">Global Order History</h1>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold uppercase text-xs">Order ID</TableHead>
              <TableHead className="font-bold uppercase text-xs">Customer</TableHead>
              <TableHead className="font-bold uppercase text-xs">Total Amount</TableHead>
              <TableHead className="font-bold uppercase text-xs">Status</TableHead>
              <TableHead className="font-bold uppercase text-xs text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order: any) => (
              <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-mono text-xs text-blue-600">#{order.id.slice(0, 10)}</TableCell>
                <TableCell className="font-bold">{order.customerName || "Guest User"}</TableCell>
                <TableCell className="font-black text-slate-900">${order.totalAmount}</TableCell>
                <TableCell>
                  <Badge className={`rounded-full px-3 py-1 border-none font-bold ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-600' : 
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-slate-400 font-medium text-sm">
                  {new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}