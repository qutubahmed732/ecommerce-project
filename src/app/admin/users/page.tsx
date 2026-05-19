import { adminDb } from "@/lib/firebaseAdmin";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserCog, ShieldAlert } from "lucide-react";

export default async function AdminUsersPage() {
  // Saare users fetch karein
  const usersSnap = await adminDb.collection("users").orderBy("createdAt", "desc").get();
  const allUsers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-slate-900">User Management</h1>
          <p className="text-slate-500 font-medium text-sm">Control roles and access for everyone on the platform.</p>
        </div>
        <UserCog size={40} className="text-blue-500" />
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-black py-5 px-8">User Details</TableHead>
              <TableHead className="font-black">Role</TableHead>
              <TableHead className="font-black">Status</TableHead>
              <TableHead className="font-black text-right px-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allUsers.map((person: any) => (
              <TableRow key={person.id} className="border-slate-50">
                <TableCell className="py-5 px-8">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{person.name}</span>
                    <span className="text-xs text-slate-400">{person.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`rounded-lg px-3 py-1 font-black text-[10px] ${
                    person.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                    person.role === 'VENDOR' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {person.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${person.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm font-bold capitalize text-slate-600">{person.status || 'active'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right px-8">
                   {/* Yahan hum status change karne ka button lagayenge */}
                   <button className="text-slate-300 hover:text-red-600 transition-colors">
                      <ShieldAlert size={20} />
                   </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}