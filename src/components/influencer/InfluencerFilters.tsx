"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { NICHES, CITIES } from "@/types";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";
import { Search, X } from "lucide-react";

export function InfluencerFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedNiches, setSelectedNiches] = useState<string[]>(
    searchParams.get("niches")?.split(",").filter(Boolean) || []
  );
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [minScore, setMinScore] = useState(parseInt(searchParams.get("minScore") || "0"));
  const [maxPrice, setMaxPrice] = useState(parseInt(searchParams.get("maxPrice") || "500000"));

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (selectedNiches.length > 0) params.set("niches", selectedNiches.join(","));
    if (city) params.set("city", city);
    if (minScore > 0) params.set("minScore", minScore.toString());
    if (maxPrice < 500000) params.set("maxPrice", maxPrice.toString());
    router.push(`/influencers?${params.toString()}`);
  }, [search, selectedNiches, city, minScore, maxPrice, router]);

  function clearFilters() {
    setSearch("");
    setSelectedNiches([]);
    setCity("");
    setMinScore(0);
    setMaxPrice(500000);
    router.push("/influencers");
  }

  function toggleNiche(niche: string) {
    setSelectedNiches(prev =>
      prev.includes(niche) ? prev.filter(n => n !== niche) : [...prev, niche]
    );
  }

  const hasFilters = search || selectedNiches.length > 0 || city || minScore > 0 || maxPrice < 500000;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label>Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Name or @handle"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && applyFilters()}
          />
        </div>
      </div>

      {/* Niches */}
      <div className="space-y-2">
        <Label>Niche</Label>
        <div className="flex flex-wrap gap-1.5">
          {NICHES.map(niche => (
            <button
              key={niche}
              type="button"
              onClick={() => toggleNiche(niche)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border transition-all",
                selectedNiches.includes(niche)
                  ? "border-purple-600 bg-purple-50 text-purple-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              {niche}
            </button>
          ))}
        </div>
      </div>

      {/* City */}
      <div className="space-y-2">
        <Label>City</Label>
        <select
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={city}
          onChange={e => setCity(e.target.value)}
        >
          <option value="">All cities</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Min Rating */}
      <div className="space-y-2">
        <Label>Min Rating Score: <span className="text-purple-700 font-semibold">{minScore}</span></Label>
        <Slider
          min={0}
          max={100}
          step={5}
          value={[minScore]}
          onValueChange={(v) => setMinScore(Array.isArray(v) ? v[0] : v)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>0</span><span>50</span><span>100</span>
        </div>
      </div>

      {/* Max Price */}
      <div className="space-y-2">
        <Label>
          Max Price:{" "}
          <span className="text-purple-700 font-semibold">
            {maxPrice >= 500000 ? "No limit" : `₹${(maxPrice / 1000).toFixed(0)}K`}
          </span>
        </Label>
        <Slider
          min={0}
          max={500000}
          step={5000}
          value={[maxPrice]}
          onValueChange={(v) => setMaxPrice(Array.isArray(v) ? v[0] : v)}
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>₹0</span><span>₹2.5L</span><span>₹5L+</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button className="flex-1 bg-purple-700 hover:bg-purple-800" onClick={applyFilters}>
          Apply Filters
        </Button>
        {hasFilters && (
          <Button variant="outline" size="icon" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
