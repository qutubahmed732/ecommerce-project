"use client"

import { 
  LayoutDashboard, 
  PackagePlus, 
  Boxes,
  LogOut // 👈 Logout icon import kiya
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore"; // 👈 Auth store import kiya
import { Button } from "@/components/ui/button"; // 👈 ShadCN Button component
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter // 👈 Footer control ke liye use hoga
} from "@/components/ui/sidebar";

const vendorMenuItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/vendor-dashboard" },
  { title: "My Products", icon: Boxes, href: "/products" },
  { title: "Add New Product", icon: PackagePlus, href: "/vendor-dashboard/add-product" },
];

export function VendorSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore(); // 👈 Logout function handle karne ke liye extract kiya

  return (
    <Sidebar className="border-r border-slate-200 bg-white">
      {/* Sidebar Header/Logo */}
      <div className="p-6 border-b border-slate-100 flex items-center h-[73px]">
        <p className="text-2xl font-black text-blue-600 tracking-tighter">
          Qutub <span className="text-slate-900">Seller</span>
        </p>
      </div>

      {/* Sidebar Navigation Context */}
      <SidebarContent className="p-4 bg-white flex-1">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {vendorMenuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link 
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-6 rounded-xl transition-all group ${
                          isActive 
                            ? "bg-blue-50 text-blue-600 font-bold" 
                            : "text-slate-500 hover:text-blue-600 hover:bg-slate-50 font-bold"
                        }`}
                      >
                        <item.icon 
                          size={20} 
                          className={isActive ? "text-blue-600" : "text-slate-400 group-hover:text-blue-600 transition-colors"} 
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

      {/* Sidebar Footer Component */}
      <SidebarFooter className="p-4 border-t border-slate-100 bg-white gap-3">
        {/* 🟥 Logout Button (Premium Minimal Design Match) */}
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start gap-3 px-4 py-6 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all"
        >
          <LogOut size={20} className="text-red-400 group-hover:text-red-600" />
          <span>Logout</span>
        </Button>

        {/* Shop Status Card */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/80">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Store Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-xs font-bold text-slate-700">Online & Active</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}