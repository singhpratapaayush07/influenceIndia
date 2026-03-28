import { prisma } from "@/lib/prisma";
import { InfluencerCard } from "@/components/influencer/InfluencerCard";
import { InfluencerFilters } from "@/components/influencer/InfluencerFilters";
import { Suspense } from "react";
import type { InfluencerWithPricing } from "@/types";

interface SearchParams {
  q?: string;
  niches?: string;
  city?: string;
  minScore?: string;
  maxPrice?: string;
  page?: string;
}

async function getInfluencers(searchParams: SearchParams): Promise<InfluencerWithPricing[]> {
  const niches = searchParams.niches?.split(",").filter(Boolean) || [];

  const profiles = await prisma.influencerProfile.findMany({
    where: {
      isVerified: true,
      ...(searchParams.q && {
        OR: [
          { displayName: { contains: searchParams.q } },
          { instagramHandle: { contains: searchParams.q } },
        ],
      }),
      ...(searchParams.city && { city: searchParams.city }),
      ...(searchParams.minScore && { overallScore: { gte: parseFloat(searchParams.minScore) } }),
    },
    include: { pricing: true },
    orderBy: { overallScore: "desc" },
    take: 24,
  });

  // Filter by niche (JSON field)
  let filtered = profiles.map(p => ({
    ...p,
    niches: (p.niches as unknown as string[]) || [],
    languages: (p.languages as unknown as string[]) || [],
  }));

  if (niches.length > 0) {
    filtered = filtered.filter(p =>
      niches.some(niche => (p.niches as string[]).includes(niche))
    );
  }

  if (searchParams.maxPrice) {
    const max = parseInt(searchParams.maxPrice);
    filtered = filtered.filter(p =>
      p.pricing.length === 0 || p.pricing.some(tier => tier.priceInr <= max)
    );
  }

  return filtered as unknown as InfluencerWithPricing[];
}

export default async function InfluencersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const influencers = await getInfluencers(searchParams);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Browse Influencers</h1>
        <p className="text-gray-500 mt-1">Discover verified Indian influencers for your next campaign</p>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4 text-gray-700">Filters</h2>
            <Suspense fallback={null}>
              <InfluencerFilters />
            </Suspense>
          </div>
        </aside>

        {/* Main Grid */}
        <main className="flex-1">
          {influencers.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-700">No influencers found</h3>
              <p className="text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">{influencers.length} influencer{influencers.length !== 1 ? "s" : ""} found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {influencers.map(influencer => (
                  <InfluencerCard key={influencer.id} influencer={influencer} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
