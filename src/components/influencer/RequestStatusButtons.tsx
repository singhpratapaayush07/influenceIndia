"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function RequestStatusButtons({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);

  async function updateStatus(status: "accepted" | "rejected") {
    setLoading(status === "accepted" ? "accept" : "reject");
    const res = await fetch(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast.error("Failed to update request");
    } else {
      toast.success(status === "accepted" ? "Request accepted!" : "Request declined");
      router.refresh();
    }
    setLoading(null);
  }

  return (
    <div className="flex gap-2 mt-3">
      <Button
        size="sm"
        className="bg-green-600 hover:bg-green-700 text-white"
        onClick={() => updateStatus("accepted")}
        disabled={!!loading}
      >
        {loading === "accept" ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
        Accept
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="border-red-300 text-red-700 hover:bg-red-50"
        onClick={() => updateStatus("rejected")}
        disabled={!!loading}
      >
        {loading === "reject" ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3 mr-1" />}
        Decline
      </Button>
    </div>
  );
}
