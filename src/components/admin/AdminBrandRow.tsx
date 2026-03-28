"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AdminBrandRowProps {
  brand: {
    id: string;
    userId: string;
    companyName: string;
    industry: string | null;
    website: string | null;
    budgetRange: string | null;
    user: { email: string };
  };
}

export function AdminBrandRow({ brand }: AdminBrandRowProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    const res = await fetch("/api/admin/brands", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: brand.userId }),
    });
    if (!res.ok) { toast.error("Failed"); }
    else { toast.success(`${brand.companyName} verified!`); router.refresh(); }
    setLoading(false);
  }

  return (
    <div className="py-4 flex items-center gap-4">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
          {brand.companyName[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{brand.companyName}</p>
        <p className="text-xs text-gray-500">{brand.user.email}</p>
        <div className="flex gap-1.5 mt-1 flex-wrap">
          {brand.industry && <Badge variant="outline" className="text-xs">{brand.industry}</Badge>}
          {brand.budgetRange && <Badge variant="outline" className="text-xs">{brand.budgetRange}</Badge>}
          {brand.website && <span className="text-xs text-blue-600">{brand.website}</span>}
        </div>
      </div>
      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleApprove} disabled={loading}>
        {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
        Approve
      </Button>
    </div>
  );
}
