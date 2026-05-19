"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Clock, Menu } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { VendorSidebar } from "@/components/vendors/vendor-sidebar";

export default function VendorAuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();

  if (user && user.role === "VENDOR" && user.status !== "active") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-blue-100 text-center border border-slate-100">
          <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Clock className="text-orange-500 w-10 h-10 animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Verification Pending</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Qutub bhai, Admin aapki shop verify kar raha hai. Jab tak status **Active** nahi hota, aap products manage nahi kar sakte.
          </p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white">
        {/* Render Responsive Custom Sidebar Component */}
        <VendorSidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 bg-slate-50/50 min-w-0 flex flex-col">
          
          {/* 📱 Mobile Toggle Header Bar - Invisible on Desktop View */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-white lg:hidden sticky top-0 z-40 h-[73px]">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-10 w-10 border shadow-sm rounded-xl flex items-center justify-center hover:bg-slate-50">
                <Menu className="h-5 w-5 text-slate-700" />
              </SidebarTrigger>
              <span className="font-extrabold text-slate-900 text-base tracking-tight">Vendor Panel</span>
            </div>
            
            <p className="text-xs font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Seller
            </p>
          </div>

          {/* Core Page Content View injection */}
          <div className="flex-1">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}