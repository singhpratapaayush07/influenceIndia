"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { NICHES, CITIES, CONTENT_TYPES } from "@/types";
import { Save, Send } from "lucide-react";

interface CampaignFormProps {
  initialData?: any;
  campaignId?: string;
}

export function CampaignForm({ initialData, campaignId }: CampaignFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    budget: initialData?.budget?.toString() || "",
    targetNiches: (initialData?.targetNiches as string[]) || [],
    targetCities: (initialData?.targetCities as string[]) || [],
    minFollowers: initialData?.minFollowers?.toString() || "",
    maxFollowers: initialData?.maxFollowers?.toString() || "",
    contentTypes: (initialData?.contentTypes as string[]) || [],
    expiresAt: initialData?.expiresAt
      ? new Date(initialData.expiresAt).toISOString().split("T")[0]
      : "",
  });

  const handleSubmit = async (status: "draft" | "active") => {
    setLoading(true);
    setError("");

    try {
      const budget = parseInt(formData.budget);

      if (!formData.title.trim() || !formData.description.trim() || !budget) {
        setError("Title, description, and budget are required");
        setLoading(false);
        return;
      }

      if (budget < 1000) {
        setError("Budget must be at least ₹1,000");
        setLoading(false);
        return;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        budget,
        targetNiches: formData.targetNiches,
        targetCities: formData.targetCities,
        minFollowers: formData.minFollowers ? parseInt(formData.minFollowers) : null,
        maxFollowers: formData.maxFollowers ? parseInt(formData.maxFollowers) : null,
        contentTypes: formData.contentTypes,
        expiresAt: formData.expiresAt || null,
        status,
      };

      const url = campaignId ? `/api/campaigns/${campaignId}` : "/api/campaigns";
      const method = campaignId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save campaign");
      }

      router.push("/dashboard/brand/campaigns");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6">
      <div>
        <Label htmlFor="title">Campaign Title *</Label>
        <Input
          id="title"
          placeholder="e.g., Summer Collection Launch Campaign"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe your campaign, goals, target audience, and expectations..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={5}
          required
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="budget">Max Budget (INR) *</Label>
          <Input
            id="budget"
            type="number"
            placeholder="e.g., 50000"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            required
            min="1000"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum: ₹1,000</p>
        </div>

        <div>
          <Label htmlFor="expiresAt">Expires On (Optional)</Label>
          <Input
            id="expiresAt"
            type="date"
            value={formData.expiresAt}
            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>

      <div>
        <Label>Target Niches (Optional)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          {NICHES.map((niche) => (
            <div key={niche} className="flex items-center space-x-2">
              <Checkbox
                id={`niche-${niche}`}
                checked={formData.targetNiches.includes(niche)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFormData({
                      ...formData,
                      targetNiches: [...formData.targetNiches, niche],
                    });
                  } else {
                    setFormData({
                      ...formData,
                      targetNiches: formData.targetNiches.filter((n) => n !== niche),
                    });
                  }
                }}
              />
              <label
                htmlFor={`niche-${niche}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {niche}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Target Cities (Optional)</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          {CITIES.map((city) => (
            <div key={city} className="flex items-center space-x-2">
              <Checkbox
                id={`city-${city}`}
                checked={formData.targetCities.includes(city)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFormData({
                      ...formData,
                      targetCities: [...formData.targetCities, city],
                    });
                  } else {
                    setFormData({
                      ...formData,
                      targetCities: formData.targetCities.filter((c) => c !== city),
                    });
                  }
                }}
              />
              <label
                htmlFor={`city-${city}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {city}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Content Types Required (Optional)</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {CONTENT_TYPES.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                id={`content-${type.value}`}
                checked={formData.contentTypes.includes(type.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFormData({
                      ...formData,
                      contentTypes: [...formData.contentTypes, type.value],
                    });
                  } else {
                    setFormData({
                      ...formData,
                      contentTypes: formData.contentTypes.filter((c) => c !== type.value),
                    });
                  }
                }}
              />
              <label
                htmlFor={`content-${type.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {type.icon} {type.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minFollowers">Min Followers (Optional)</Label>
          <Input
            id="minFollowers"
            type="number"
            placeholder="e.g., 10000"
            value={formData.minFollowers}
            onChange={(e) => setFormData({ ...formData, minFollowers: e.target.value })}
            min="0"
          />
        </div>

        <div>
          <Label htmlFor="maxFollowers">Max Followers (Optional)</Label>
          <Input
            id="maxFollowers"
            type="number"
            placeholder="e.g., 100000"
            value={formData.maxFollowers}
            onChange={(e) => setFormData({ ...formData, maxFollowers: e.target.value })}
            min="0"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSubmit("draft")}
          disabled={loading}
          className="flex-1"
        >
          <Save className="h-4 w-4 mr-2" />
          Save as Draft
        </Button>
        <Button
          type="button"
          onClick={() => handleSubmit("active")}
          disabled={loading}
          className="flex-1 bg-purple-700 hover:bg-purple-800"
        >
          <Send className="h-4 w-4 mr-2" />
          {loading ? "Publishing..." : "Publish Campaign"}
        </Button>
      </div>
    </form>
  );
}
