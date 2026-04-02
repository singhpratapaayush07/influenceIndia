"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield, IndianRupee, AlertTriangle, CheckCircle2, Clock,
  Loader2, Lock, Unlock, FileCheck, Ban, Gavel,
} from "lucide-react";
import { toast } from "sonner";
import { PLATFORM_FEE_PERCENT } from "@/lib/escrow";

interface EscrowPanelProps {
  contactRequestId: string;
  contactRequestStatus: string;
  isBrand: boolean;
  isAdmin?: boolean;
  suggestedAmount?: number;
}

interface EscrowData {
  id: string;
  amountInr: number;
  platformFeeInr: number;
  status: string;
  paidAt: string | null;
  releasedAt: string | null;
  deliverableProof: string | null;
  disputeReason: string | null;
  razorpayOrderId: string | null;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function EscrowPanel({
  contactRequestId,
  contactRequestStatus,
  isBrand,
  isAdmin = false,
  suggestedAmount,
}: EscrowPanelProps) {
  const [escrow, setEscrow] = useState<EscrowData | null>(null);
  const [razorpayKeyId, setRazorpayKeyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [amount, setAmount] = useState(suggestedAmount?.toString() || "");
  const [deliveryProof, setDeliveryProof] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [showDisputeForm, setShowDisputeForm] = useState(false);

  const fetchEscrow = useCallback(async () => {
    try {
      const res = await fetch(`/api/escrow?contactRequestId=${contactRequestId}`);
      if (res.ok) {
        const data = await res.json();
        setEscrow(data.escrow);
        if (data.razorpayKeyId) setRazorpayKeyId(data.razorpayKeyId);
      }
    } finally {
      setLoading(false);
    }
  }, [contactRequestId]);

  useEffect(() => {
    fetchEscrow();
  }, [fetchEscrow]);

  // Load Razorpay script
  useEffect(() => {
    if (typeof window !== "undefined" && !document.getElementById("razorpay-script")) {
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  async function handleCreateEscrow() {
    const amountNum = parseInt(amount);
    if (!amountNum || amountNum < 500) {
      toast.error("Minimum amount is INR 500");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactRequestId, amountInr: amountNum }),
      });

      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }

      // Open Razorpay checkout
      const options = {
        key: data.razorpayKeyId,
        amount: data.amountInr * 100,
        currency: "INR",
        name: "InfluenceIndia",
        description: "Escrow Payment for Collaboration",
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
          // Verify payment on server
          const verifyRes = await fetch(`/api/escrow/${data.escrowId}/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          if (verifyRes.ok) {
            toast.success("Payment secured in escrow!");
            fetchEscrow();
          } else {
            toast.error("Payment verification failed");
          }
        },
        theme: { color: "#7c3aed" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch {
      toast.error("Failed to create escrow");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCompletePayment() {
    if (!escrow || !razorpayKeyId) return;
    setActionLoading(true);
    try {
      const options = {
        key: razorpayKeyId,
        amount: escrow.amountInr * 100,
        currency: "INR",
        name: "InfluenceIndia",
        description: "Escrow Payment for Collaboration",
        order_id: escrow.razorpayOrderId,
        handler: async function (response: any) {
          const verifyRes = await fetch(`/api/escrow/${escrow.id}/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          if (verifyRes.ok) {
            toast.success("Payment secured in escrow!");
            fetchEscrow();
          } else {
            toast.error("Payment verification failed");
          }
        },
        theme: { color: "#7c3aed" },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch {
      toast.error("Failed to open payment");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSubmitDelivery() {
    if (!deliveryProof.trim()) { toast.error("Please describe your deliverables"); return; }
    if (!escrow) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/escrow/${escrow.id}/deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliverableProof: deliveryProof }),
      });

      if (res.ok) {
        toast.success("Delivery proof submitted!");
        fetchEscrow();
        setDeliveryProof("");
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRelease() {
    if (!escrow) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/escrow/${escrow.id}/release`, {
        method: "POST",
      });

      if (res.ok) {
        toast.success("Funds released to influencer!");
        fetchEscrow();
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDispute() {
    if (!disputeReason.trim()) { toast.error("Please explain the dispute"); return; }
    if (!escrow) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/escrow/${escrow.id}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: disputeReason }),
      });

      if (res.ok) {
        toast.success("Dispute raised. Our team will review within 48 hours.");
        fetchEscrow();
        setShowDisputeForm(false);
        setDisputeReason("");
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function handleResolveDispute(resolution: "release" | "refund") {
    if (!escrow) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/escrow/${escrow.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution }),
      });

      if (res.ok) {
        toast.success(
          resolution === "release"
            ? "Funds released to influencer. Dispute resolved."
            : "Funds will be refunded to brand. Dispute resolved."
        );
        fetchEscrow();
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="py-6 text-center">
          <Loader2 className="h-5 w-5 animate-spin mx-auto text-purple-500" />
        </CardContent>
      </Card>
    );
  }

  // No escrow yet — show creation form for brand (only if request is accepted)
  if (!escrow && isBrand && contactRequestStatus === "accepted") {
    return (
      <Card className="border-purple-200 bg-purple-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-600" />
            Secure Payment with Escrow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-gray-600">
            Protect your payment by using escrow. Funds are held securely until the influencer delivers the agreed content.
            A {PLATFORM_FEE_PERCENT}% platform fee applies.
          </p>
          <div className="space-y-1.5">
            <Label className="text-xs">Amount (INR)</Label>
            <Input
              type="number"
              min="500"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-9"
            />
            {amount && parseInt(amount) >= 500 && (
              <p className="text-xs text-gray-500">
                Platform fee: INR {Math.round(parseInt(amount) * PLATFORM_FEE_PERCENT / 100).toLocaleString("en-IN")} |
                Influencer receives: INR {Math.round(parseInt(amount) * (100 - PLATFORM_FEE_PERCENT) / 100).toLocaleString("en-IN")}
              </p>
            )}
          </div>
          <Button
            className="w-full bg-purple-700 hover:bg-purple-800"
            onClick={handleCreateEscrow}
            disabled={actionLoading || !amount || parseInt(amount) < 500}
          >
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
            Pay & Lock in Escrow
          </Button>
        </CardContent>
      </Card>
    );
  }

  // No escrow and not brand / not accepted — show info
  if (!escrow) {
    if (!isBrand && contactRequestStatus === "accepted") {
      return (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="py-4">
            <p className="text-sm text-blue-800 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Waiting for the brand to initiate escrow payment.
            </p>
          </CardContent>
        </Card>
      );
    }
    return null; // Don't show for pending/rejected requests
  }

  // Escrow exists — show status
  const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    pending: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: <Clock className="h-3 w-3" />, label: "Awaiting Payment" },
    held: { color: "bg-green-50 text-green-700 border-green-200", icon: <Lock className="h-3 w-3" />, label: "Funds Secured" },
    released: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: <Unlock className="h-3 w-3" />, label: "Funds Released" },
    refunded: { color: "bg-gray-50 text-gray-700 border-gray-200", icon: <IndianRupee className="h-3 w-3" />, label: "Refunded" },
    disputed: { color: "bg-red-50 text-red-700 border-red-200", icon: <AlertTriangle className="h-3 w-3" />, label: "Under Dispute" },
  };

  const config = statusConfig[escrow.status] || statusConfig.pending;

  return (
    <Card className="border-purple-200 bg-purple-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-600" />
            Escrow Payment
          </CardTitle>
          <Badge className={`${config.color} text-xs gap-1`}>
            {config.icon}
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Amount summary */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Amount</span>
          <span className="font-bold text-gray-900 flex items-center">
            <IndianRupee className="h-3.5 w-3.5" />
            {escrow.amountInr.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Platform fee ({PLATFORM_FEE_PERCENT}%)</span>
          <span>INR {escrow.platformFeeInr.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Influencer payout</span>
          <span className="font-medium text-green-700">
            INR {(escrow.amountInr - escrow.platformFeeInr).toLocaleString("en-IN")}
          </span>
        </div>

        {/* Brand: complete pending payment */}
        {escrow.status === "pending" && isBrand && razorpayKeyId && (
          <div className="pt-2 border-t">
            <Button
              className="w-full bg-purple-700 hover:bg-purple-800"
              onClick={handleCompletePayment}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
              Complete Payment
            </Button>
          </div>
        )}

        {/* Delivery proof section */}
        {escrow.deliverableProof && (
          <div className="bg-white border rounded-lg p-3">
            <p className="text-xs font-medium text-gray-700 flex items-center gap-1 mb-1">
              <FileCheck className="h-3.5 w-3.5 text-green-600" /> Delivery Proof
            </p>
            <p className="text-xs text-gray-600">{escrow.deliverableProof}</p>
          </div>
        )}

        {/* Dispute reason */}
        {escrow.disputeReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs font-medium text-red-700 flex items-center gap-1 mb-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Dispute Reason
            </p>
            <p className="text-xs text-red-600">{escrow.disputeReason}</p>
          </div>
        )}

        {/* Actions based on status and role */}

        {/* Influencer: submit delivery proof when escrow is held */}
        {escrow.status === "held" && !isBrand && !escrow.deliverableProof && (
          <div className="space-y-2 pt-2 border-t">
            <Label className="text-xs">Submit Delivery Proof</Label>
            <Textarea
              placeholder="Describe what was delivered (e.g., 'Posted 2 Instagram reels on March 15, Story on March 16')"
              value={deliveryProof}
              onChange={(e) => setDeliveryProof(e.target.value)}
              rows={3}
              className="text-sm"
            />
            <Button
              size="sm"
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleSubmitDelivery}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
              Submit Delivery
            </Button>
          </div>
        )}

        {/* Brand: release funds or dispute when proof submitted */}
        {escrow.status === "held" && isBrand && escrow.deliverableProof && (
          <div className="space-y-2 pt-2 border-t">
            <Button
              size="sm"
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleRelease}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Unlock className="h-3 w-3 mr-1" />}
              Approve & Release Payment
            </Button>
            {!showDisputeForm ? (
              <Button
                size="sm"
                variant="outline"
                className="w-full border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => setShowDisputeForm(true)}
              >
                <Ban className="h-3 w-3 mr-1" /> Raise Dispute
              </Button>
            ) : (
              <div className="space-y-2">
                <Textarea
                  placeholder="Explain why you're disputing..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  rows={2}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowDisputeForm(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={handleDispute}
                    disabled={actionLoading}
                  >
                    Submit Dispute
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Completed state */}
        {escrow.status === "released" && (
          <div className="text-center py-2">
            <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-green-700 font-medium">Collaboration completed successfully</p>
            {escrow.releasedAt && (
              <p className="text-xs text-gray-400 mt-1">
                Released on {new Date(escrow.releasedAt).toLocaleDateString("en-IN")}
              </p>
            )}
          </div>
        )}

        {/* Refunded state */}
        {escrow.status === "refunded" && (
          <div className="text-center py-2">
            <IndianRupee className="h-6 w-6 text-gray-500 mx-auto mb-1" />
            <p className="text-xs text-gray-700 font-medium">Payment refunded to brand</p>
          </div>
        )}

        {/* Disputed state — info for brand/influencer */}
        {escrow.status === "disputed" && !isAdmin && (
          <div className="text-center py-2 border-t">
            <Gavel className="h-5 w-5 text-amber-600 mx-auto mb-1" />
            <p className="text-xs text-amber-700 font-medium">Under review by InfluenceIndia team</p>
            <p className="text-xs text-gray-400 mt-1">Disputes are typically resolved within 48 hours</p>
          </div>
        )}

        {/* Admin: resolve dispute */}
        {escrow.status === "disputed" && isAdmin && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
              <Gavel className="h-3.5 w-3.5" /> Admin: Resolve Dispute
            </p>
            <Button
              size="sm"
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => handleResolveDispute("release")}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Unlock className="h-3 w-3 mr-1" />}
              Release to Influencer
            </Button>
            <Button
              size="sm"
              className="w-full bg-amber-600 hover:bg-amber-700"
              onClick={() => handleResolveDispute("refund")}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <IndianRupee className="h-3 w-3 mr-1" />}
              Refund to Brand
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
