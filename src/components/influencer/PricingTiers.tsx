import { TIER_TYPES } from "@/types";
import { formatPrice } from "@/lib/scoring";
import { Clock } from "lucide-react";

interface PricingTier {
  tierType: string;
  priceInr: number;
  description: string | null;
  turnaroundDays: number;
}

interface PricingTiersProps {
  pricing: PricingTier[];
}

export function PricingTiers({ pricing }: PricingTiersProps) {
  if (pricing.length === 0) {
    return <p className="text-sm text-gray-400">Pricing not set yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {pricing.map(tier => {
        const tierMeta = TIER_TYPES.find(t => t.value === tier.tierType);
        return (
          <div key={tier.tierType} className="border rounded-xl p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm text-gray-800">
                {tierMeta?.icon} {tierMeta?.label || tier.tierType}
              </span>
              <span className="text-lg font-bold text-purple-700">{formatPrice(tier.priceInr)}</span>
            </div>
            {tier.description && (
              <p className="text-xs text-gray-500 mb-2">{tier.description}</p>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              {tier.turnaroundDays} day{tier.turnaroundDays !== 1 ? "s" : ""} turnaround
            </div>
          </div>
        );
      })}
    </div>
  );
}
