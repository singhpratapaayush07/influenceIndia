import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { InfluencerCard } from "@/components/influencer/InfluencerCard";
import { NICHES } from "@/types";
import {
  TrendingUp,
  Shield,
  Star,
  Building2,
  ArrowRight,
  Users,
  Search,
  Send,
} from "lucide-react";
import type { InfluencerWithPricing } from "@/types";

async function getFeaturedInfluencers(): Promise<InfluencerWithPricing[]> {
  const profiles = await prisma.influencerProfile.findMany({
    where: { isVerified: true },
    include: { pricing: { orderBy: { priceInr: "asc" } } },
    orderBy: { overallScore: "desc" },
    take: 6,
  });
  return profiles.map(p => ({
    ...p,
    niches: p.niches,
    languages: p.languages,
  })) as unknown as InfluencerWithPricing[];
}

const NICHE_ICONS: Record<string, string> = {
  Fashion: "👗", Beauty: "💄", Tech: "💻", Food: "🍜", Travel: "✈️",
  Fitness: "💪", Lifestyle: "🌟", Gaming: "🎮", Finance: "💰",
  Education: "📚", Entertainment: "🎭", Sports: "⚽", Parenting: "👶",
  Photography: "📸", Music: "🎵",
};

export default async function HomePage() {
  const featuredInfluencers = await getFeaturedInfluencers();
  const [totalInfluencers, totalBrands] = await Promise.all([
    prisma.influencerProfile.count({ where: { isVerified: true } }),
    prisma.brandProfile.count({ where: { isVerified: true } }),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-pink-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-400 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <Badge className="bg-white/20 text-white border-white/30 mb-4 text-sm px-4 py-1.5">
            🇮🇳 India&apos;s #1 Influencer Marketplace
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Connect Brands with<br />
            <span className="text-pink-300">India&apos;s Top Creators</span>
          </h1>
          <p className="text-lg md:text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
            Find verified influencers across every niche — Fashion, Tech, Food, Fitness and more.
            Real metrics. Transparent pricing. Zero guesswork.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-purple-900 hover:bg-purple-50 font-semibold px-8" asChild>
              <Link href="/influencers">Browse Influencers <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold px-8" asChild>
              <Link href="/signup?type=influencer">Join as Creator</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-sm mx-auto">
            {[
              { value: `${totalInfluencers}+`, label: "Verified Creators" },
              { value: `${totalBrands}+`, label: "Active Brands" },
              { value: "₹0", label: "Platform Fee" },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-purple-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works for Brands */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 mb-3">For Brands</Badge>
            <h2 className="text-3xl font-bold text-gray-900">Find the right influencer in minutes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Search className="h-6 w-6" />, step: "1", title: "Browse & Filter", desc: "Search influencers by niche, city, followers, engagement rate, and budget." },
              { icon: <Star className="h-6 w-6" />, step: "2", title: "Check Verified Metrics", desc: "Every influencer is verified. See real follower counts, engagement rates, and transparent pricing." },
              { icon: <Send className="h-6 w-6" />, step: "3", title: "Send Request", desc: "Choose the content type (story, post, reel, video) and send a collaboration request directly." },
            ].map(item => (
              <div key={item.step} className="text-center p-6">
                <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="text-sm font-medium text-blue-600 mb-2">Step {item.step}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button className="bg-purple-700 hover:bg-purple-800" asChild>
              <Link href="/signup?type=brand">Start Finding Influencers <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works for Influencers */}
      <section className="py-16 px-4 bg-purple-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 mb-3">For Influencers</Badge>
            <h2 className="text-3xl font-bold text-gray-900">Get discovered by top Indian brands</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Users className="h-6 w-6" />, step: "1", title: "Create Your Profile", desc: "Add your social handles, niche, bio, and set your pricing for different content types." },
              { icon: <Shield className="h-6 w-6" />, step: "2", title: "Get Verified", desc: "Our team reviews and verifies your profile. Once approved, you go live on the marketplace." },
              { icon: <TrendingUp className="h-6 w-6" />, step: "3", title: "Get Paid Collabs", desc: "Brands discover you, send collaboration requests, and you negotiate deals directly." },
            ].map(item => (
              <div key={item.step} className="text-center p-6">
                <div className="w-14 h-14 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="text-sm font-medium text-purple-600 mb-2">Step {item.step}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button className="bg-purple-700 hover:bg-purple-800" asChild>
              <Link href="/signup?type=influencer">Join as a Creator <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Browse by Niche */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Explore by Niche</h2>
            <p className="text-gray-500 mt-2">Influencers across every category</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {NICHES.slice(0, 15).map(niche => (
              <Link
                key={niche}
                href={`/influencers?niches=${niche}`}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:border-purple-300 hover:bg-purple-50 transition-all text-center group"
              >
                <span className="text-2xl">{NICHE_ICONS[niche] || "⭐"}</span>
                <span className="text-xs font-medium text-gray-600 group-hover:text-purple-700">{niche}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Influencers */}
      {featuredInfluencers.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-5xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Top Influencers</h2>
                <p className="text-gray-500 mt-1">Verified creators with highest ratings</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/influencers">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredInfluencers.map(inf => (
                <InfluencerCard key={inf.id} influencer={inf} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why InfluenceIndia */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Why InfluenceIndia?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { icon: "🔍", title: "Verified Only", desc: "Every influencer is manually reviewed. No fake followers, no inflated metrics." },
              { icon: "💰", title: "Transparent Pricing", desc: "See exact pricing upfront. Story, post, reel, video — all clearly listed." },
              { icon: "🇮🇳", title: "Made for India", desc: "Designed for the Indian market — cities, languages, regional niches." },
              { icon: "⚡", title: "Fast Onboarding", desc: "Create your profile in minutes. Go live within 48 hours of verification." },
              { icon: "📊", title: "Real Metrics", desc: "Engagement rate, follower count, virality score — all verified by our team." },
              { icon: "🆓", title: "Free to Join", desc: "Zero platform fees. We take nothing from your collaboration deals." },
            ].map(item => (
              <div key={item.title} className="p-5 rounded-2xl bg-gray-50 text-left">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-700 to-pink-700 text-white text-center">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to grow together?</h2>
          <p className="text-purple-200 mb-8">Join thousands of brands and creators building authentic campaigns across India.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-purple-900 hover:bg-purple-50 font-semibold" asChild>
              <Link href="/signup?type=brand"><Building2 className="mr-2 h-4 w-4" />I&apos;m a Brand</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold" asChild>
              <Link href="/signup?type=influencer"><Star className="mr-2 h-4 w-4" />I&apos;m a Creator</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
