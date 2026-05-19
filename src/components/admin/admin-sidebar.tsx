"use client"

import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Package, 
  LogOut // 👈 Logout icon import kiya
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore"; // 👈 Auth store import kiya
import { Button } from "@/components/ui/button"; // 👈 Button component
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Overview", icon: LayoutDashboard, href: "/admin" },
  { title: "User Management", icon: Users, href: "/admin/users" },
  { title: "Vendor Approvals", icon: Store, href: "/admin/vendors" },
  { title: "Total Products", icon: Package, href: "/admin/products" }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore(); // 👈 Logout trigger function extract kiya

  return (
    <Sidebar className="border-r border-slate-800 bg-slate-900 text-white" variant="sidebar">
      {/* 🔹 Sidebar Brand Logo */}
      <div className="p-6 border-b border-slate-800 flex items-center h-[73px] bg-slate-900">
        <p className="text-2xl font-black text-blue-400 tracking-tighter">
          Qutub <span className="text-white">Admin</span>
        </p>
      </div>

      {/* 🔹 Sidebar Navigation Stream */}
      <SidebarContent className="p-4 bg-slate-900">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link 
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-6 rounded-xl transition-all group ${
                          isActive 
                            ? "bg-slate-800 text-blue-400 font-bold shadow-inner" 
                            : "text-slate-400 hover:text-white hover:bg-slate-800/50 font-bold"
                        }`}
                      >
                        <item.icon 
                          size={20} 
                          className={isActive ? "text-blue-400" : "text-slate-400 group-hover:text-blue-400 transition-colors"} 
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 🔹 Sidebar User Session Card Footer */}
      <SidebarFooter className="p-4 border-t border-slate-800 bg-slate-900 gap-3">
        {/* 🟥 Admin Logout Button */}
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start gap-3 px-4 py-6 text-red-400 hover:text-red-500 hover:bg-red-950/30 rounded-xl font-bold transition-all group border border-transparent hover:border-red-900/50"
        >
          <LogOut size={20} className="text-red-400 group-hover:text-red-500 transition-colors" />
          <span>Logout</span>
        </Button>

        {/* Admin Profile Card */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-md">
            A
          </div>
          <div>
            <p className="text-xs font-black text-white">Admin Mode</p>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Super Admin</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}