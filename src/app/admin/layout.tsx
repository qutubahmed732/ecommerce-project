import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Menu } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        {/* Render Responsive Admin Standard Navigation */}
        <AdminSidebar />
        
        {/* Core Content Area Wrapper */}
        <main className="flex-1 min-w-0 flex flex-col">
          
          {/* 📱 Mobile Top Header Control Layout (Visible only on mobile/tablet) */}
          <div className="flex items-center justify-between px-4 md:px-8 py-4 border-b bg-white lg:hidden sticky top-0 z-40 h-[73px] shadow-sm">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-10 w-10 border border-slate-200 shadow-sm rounded-xl flex items-center justify-center hover:bg-slate-50 transition-all">
                <Menu className="h-5 w-5 text-slate-700" />
              </SidebarTrigger>
              <span className="font-black text-slate-900 text-sm md:text-base tracking-tight">
                Admin Center
              </span>
            </div>
            <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full uppercase tracking-widest">
              Root
            </span>
          </div>

          {/* 🖥️ Core Page Workspace Body */}
          <div className="flex-1 p-4 md:p-8 lg:p-10 max-w-[1600px] w-full mx-auto">
            {/* Desktop Dashboard Header Title Section */}
            <div className="hidden lg:flex items-center mb-8">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                Admin Control Center
              </h1>
            </div>

            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}