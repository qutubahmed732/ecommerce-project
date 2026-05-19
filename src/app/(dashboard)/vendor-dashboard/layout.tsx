import VendorAuthGuard from "./vendor-auth-guard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Dashboard | Qutub Store",
  description: "Manage your inventory and orders seamlessly.",
};

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <VendorAuthGuard>
      {children}
    </VendorAuthGuard>
  );
}