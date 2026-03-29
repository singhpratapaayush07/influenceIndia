"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

interface ProposalActionsProps {
  proposalId: string;
  currentStatus: string;
}

export function ProposalActions({ proposalId, currentStatus }: ProposalActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to ${newStatus} this proposal?`)) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update proposal");
      }

      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus !== "pending") return null;

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        className="text-green-700 border-green-200 hover:bg-green-50"
        onClick={() => handleStatusChange("accepted")}
        disabled={loading}
      >
        <CheckCircle2 className="h-4 w-4 mr-1" />
        Accept
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="text-red-700 border-red-200 hover:bg-red-50"
        onClick={() => handleStatusChange("rejected")}
        disabled={loading}
      >
        <XCircle className="h-4 w-4 mr-1" />
        Reject
      </Button>
    </div>
  );
}
