"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteProductAdmin } from "@/lib/actions/admin-actions";
import { toast } from "sonner"; // Ya jo bhi aap use kar rahe hain

export function DeleteProductBtn({ id }: { id: string }) {
  const handleDelete = async () => {
    const confirm = window.confirm("Qutub bhai, kya aap waqayi ye product delete karna chahte hain?");
    if (!confirm) return;

    const res = await deleteProductAdmin(id);
    if (res.success) {
      toast.success("Product deleted successfully!");
    } else {
      toast.error("Kuch masla hua delete karne mein.");
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleDelete}
      className="rounded-xl text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all"
    >
      <Trash2 size={18} />
    </Button>
  );
}