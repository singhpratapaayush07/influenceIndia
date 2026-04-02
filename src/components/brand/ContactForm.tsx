"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TIER_TYPES } from "@/types";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/scoring";
import { Loader2, Send, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { detectContactInfo } from "@/lib/content-filter";

interface Pricing {
  tierType: string;
  priceInr: number;
}

interface ContactFormProps {
  influencerUserId: string;
  influencerName: string;
  pricing: Pricing[];
}

export function ContactForm({ influencerUserId, influencerName, pricing }: ContactFormProps) {
  const [selectedTier, setSelectedTier] = useState(pricing[0]?.tierType || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const contactWarning = useMemo(() => {
    if (message.length < 5) return null;
    const result = detectContactInfo(message);
    return result.detected ? result.types : null;
  }, [message]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) { toast.error("Please write a message"); return; }
    setLoading(true);

    const fd = new FormData();
    fd.append("influencerUserId", influencerUserId);
    fd.append("tierType", selectedTier);
    fd.append("message", message);

    const res = await fetch("/api/contact", { method: "POST", body: fd });
    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Failed to send request");
      setLoading(false);
      return;
    }

    setSent(true);
    toast.success(`Request sent to ${influencerName}!`);
  }

  if (sent) {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="font-semibold text-gray-800">Request Sent!</h3>
        <p className="text-sm text-gray-500 mt-1">
          {influencerName} will see your request in their dashboard.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {pricing.length > 0 && (
        <div className="space-y-2">
          <Label>Content Type</Label>
          <div className="grid grid-cols-2 gap-2">
            {pricing.map(tier => {
              const meta = TIER_TYPES.find(t => t.value === tier.tierType);
              return (
                <button
                  type="button"
                  key={tier.tierType}
                  onClick={() => setSelectedTier(tier.tierType)}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all",
                    selectedTier === tier.tierType
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="text-sm font-medium">{meta?.icon} {meta?.label}</div>
                  <div className="text-xs text-purple-700 font-semibold mt-0.5">{formatPrice(tier.priceInr)}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Your Message</Label>
        <Textarea
          placeholder={`Hi ${influencerName}! I'd love to collaborate with you on...`}
          rows={4}
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
        />
        <p className="text-xs text-gray-400">Include your campaign brief, timeline, and any specific requirements.</p>
        {contactWarning && (
          <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            <ShieldAlert className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <p>Contact information ({contactWarning.join(", ")}) will be automatically removed. All communication must happen through the platform.</p>
          </div>
        )}
      </div>

      <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
        Send Collaboration Request
      </Button>
    </form>
  );
}
