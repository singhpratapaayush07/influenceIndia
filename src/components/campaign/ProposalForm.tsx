"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";

interface ProposalFormProps {
  campaignId: string;
  maxBudget: number;
}

export function ProposalForm({ campaignId, maxBudget }: ProposalFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    proposedPrice: "",
    message: "",
    deliverables: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const proposedPrice = parseInt(formData.proposedPrice);

      if (proposedPrice < 1000) {
        setError("Proposed price must be at least ₹1,000");
        setLoading(false);
        return;
      }

      if (proposedPrice > maxBudget) {
        setError("Proposed price cannot exceed campaign budget");
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/campaigns/${campaignId}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposedPrice,
          message: formData.message,
          deliverables: formData.deliverables,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit proposal");
      }

      router.refresh();
      alert("Proposal submitted successfully!");
      router.push("/campaigns");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Your Proposal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="proposedPrice">Your Proposed Price (INR) *</Label>
            <Input
              id="proposedPrice"
              type="number"
              placeholder="e.g., 50000"
              value={formData.proposedPrice}
              onChange={(e) => setFormData({ ...formData, proposedPrice: e.target.value })}
              required
              min="1000"
              max={maxBudget}
            />
            <p className="text-xs text-gray-500 mt-1">
              Min: ₹1,000 | Max: ₹{maxBudget.toLocaleString("en-IN")}
            </p>
          </div>

          <div>
            <Label htmlFor="deliverables">What You&apos;ll Deliver</Label>
            <Textarea
              id="deliverables"
              placeholder="e.g., 1 Instagram Reel + 2 Stories + 1 Feed Post"
              value={formData.deliverables}
              onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="message">Pitch Message</Label>
            <Textarea
              id="message"
              placeholder="Tell the brand why you&apos;re the perfect fit for this campaign..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-purple-700 hover:bg-purple-800"
            disabled={loading}
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Submitting..." : "Submit Proposal"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
