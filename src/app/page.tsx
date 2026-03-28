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
  CheckCircle2,
  Zap,
  BarChart3,
  Globe2,
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
    <div className="min-h-screen bg-white">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-[#1a0533] via-[#3b0764] to-[#6b21a8] text-white overflow-hidden">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[120px]" />
          <div className="absolute top-10 right-0 w-[400px] h-[400px] bg-violet-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/2 w-[600px] h-[300px] bg-fuchsia-700/10 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 container mx-auto max-w-6xl px-4 pt-24 pb-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-purple-200 mb-6 backdrop-blur-sm">
            <span className="text-base">🇮🇳</span> India&apos;s #1 Influencer Marketplace
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6">
            Connect Brands with<br />
            <span className="bg-gradient-to-r from-pink-400 via-fuchsia-300 to-violet-300 bg-clip-text text-transparent">
              India&apos;s Top Creators
            </span>
          </h1>

          <p className="text-lg md:text-xl text-purple-200/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Find verified influencers across every niche — Fashion, Tech, Food, Fitness and more.
            Real metrics. Transparent pricing. Zero guesswork.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              className="bg-white text-purple-900 hover:bg-purple-50 font-bold px-8 h-13 text-base shadow-xl shadow-purple-900/30"
              asChild
            >
              <Link href="/influencers">
                Browse Influencers <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-transparent border-2 border-white/50 text-white hover:bg-white/10 hover:border-white font-bold px-8 h-13 text-base backdrop-blur-sm transition-all"
              asChild
            >
              <Link href="/signup?type=influencer">
                <Star className="mr-2 h-4 w-4" /> Join as Creator
              </Link>
            </Button>
          </div>

          {/* Stats bar */}
          <div className="inline-grid grid-cols-3 divide-x divide-white/20 bg-white/10 border border-white/20 rounded-2xl px-2 backdrop-blur-md">
            {[
              { value: `${totalInfluencers}+`, label: "Verified Creators" },
              { value: `${totalBrands}+`, label: "Active Brands" },
              { value: "₹0", label: "Platform Fee" },
            ].map(stat => (
              <div key={stat.label} className="px-8 py-4 text-center">
                <div className="text-2xl font-extrabold text-white">{stat.value}</div>
                <div className="text-xs text-purple-300 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 0C1200 40 720 60 0 0L0 60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── Trusted by logos strip ────────────────────────── */}
      <section className="py-10 px-4 border-b border-gray-100">
        <div className="container mx-auto max-w-5xl text-center">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-6">Brands already on the platform</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {["Myntra", "Mamaearth", "Zepto", "boAt", "Nykaa"].map(brand => (
              <span key={brand} className="text-gray-300 font-bold text-xl tracking-tight">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works — Brands ────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <Badge className="bg-blue-50 text-blue-700 border-blue-100 mb-3 text-xs font-semibold tracking-wide uppercase">For Brands</Badge>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Find the right influencer<br />in minutes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Search className="h-5 w-5" />, step: "01", title: "Browse & Filter", desc: "Search by niche, city, followers, engagement rate, and budget. Smart filters find the perfect match.", color: "blue" },
              { icon: <BarChart3 className="h-5 w-5" />, step: "02", title: "Verified Metrics", desc: "Every influencer is manually verified. Real follower counts, real engagement rates, transparent pricing.", color: "indigo" },
              { icon: <Send className="h-5 w-5" />, step: "03", title: "Collab in One Click", desc: "Choose content type — story, post, reel, video — and send a request directly. No middlemen.", color: "purple" },
            ].map(item => (
              <div key={item.step} className="relative p-7 rounded-2xl bg-gray-50 border border-gray-100 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-50 transition-all group">
                <div className="absolute top-6 right-6 text-4xl font-black text-gray-100 group-hover:text-purple-100 transition-colors">{item.step}</div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${item.color === "blue" ? "bg-blue-100 text-blue-600" : item.color === "indigo" ? "bg-indigo-100 text-indigo-600" : "bg-purple-100 text-purple-600"}`}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button className="bg-purple-700 hover:bg-purple-800 font-semibold px-7 h-11" asChild>
              <Link href="/signup?type=brand">Start Finding Influencers <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── How it works — Creators ──────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 mb-3 text-xs font-semibold tracking-wide uppercase">For Creators</Badge>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Get discovered by top<br />Indian brands</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Users className="h-5 w-5" />, step: "01", title: "Build Your Profile", desc: "Add social handles, niche, bio and set your pricing for stories, posts, reels and videos." },
              { icon: <Shield className="h-5 w-5" />, step: "02", title: "Get Verified", desc: "Our team reviews your profile within 48 hours. Once approved you go live on the marketplace." },
              { icon: <TrendingUp className="h-5 w-5" />, step: "03", title: "Earn From Collabs", desc: "Brands discover you and send requests. Accept the ones that match your value. No commission." },
            ].map(item => (
              <div key={item.step} className="relative p-7 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100 transition-all group">
                <div className="absolute top-6 right-6 text-4xl font-black text-purple-50 group-hover:text-purple-100 transition-colors">{item.step}</div>
                <div className="w-11 h-11 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-5">
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button className="bg-purple-700 hover:bg-purple-800 font-semibold px-7 h-11" asChild>
              <Link href="/signup?type=influencer">Join as a Creator <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Browse by Niche ──────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Explore by Niche</h2>
            <p className="text-gray-400 mt-2 text-base">Top creators across every category in India</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {NICHES.slice(0, 15).map(niche => (
              <Link
                key={niche}
                href={`/influencers?niches=${niche}`}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:border-purple-300 hover:bg-purple-50 hover:shadow-md transition-all text-center group"
              >
                <span className="text-2xl">{NICHE_ICONS[niche] || "⭐"}</span>
                <span className="text-xs font-semibold text-gray-500 group-hover:text-purple-700 transition-colors">{niche}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Influencers ─────────────────────────── */}
      {featuredInfluencers.length > 0 && (
        <section className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto max-w-5xl">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-semibold tracking-widest text-purple-600 uppercase mb-1">Featured</p>
                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Top Influencers</h2>
                <p className="text-gray-400 mt-1">Verified creators with the highest ratings</p>
              </div>
              <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 hidden sm:flex" asChild>
                <Link href="/influencers">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredInfluencers.map(inf => (
                <InfluencerCard key={inf.id} influencer={inf} />
              ))}
            </div>
            <div className="text-center mt-8 sm:hidden">
              <Button variant="outline" className="border-purple-200 text-purple-700" asChild>
                <Link href="/influencers">View All Influencers <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ── Why InfluenceIndia ───────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Why InfluenceIndia?</h2>
            <p className="text-gray-400 mt-2">Built for the Indian creator economy</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { icon: <CheckCircle2 className="h-5 w-5 text-green-600" />, bg: "bg-green-50", title: "Verified Only", desc: "Every influencer is manually reviewed. No fake followers, no inflated metrics." },
              { icon: <Zap className="h-5 w-5 text-yellow-600" />, bg: "bg-yellow-50", title: "Transparent Pricing", desc: "See exact pricing upfront. Story, post, reel, video — all clearly listed in ₹." },
              { icon: <Globe2 className="h-5 w-5 text-blue-600" />, bg: "bg-blue-50", title: "Made for India", desc: "Designed for the Indian market — cities, languages, and regional niches." },
              { icon: <TrendingUp className="h-5 w-5 text-purple-600" />, bg: "bg-purple-50", title: "Fast Onboarding", desc: "Create your profile in minutes. Go live within 48 hours of verification." },
              { icon: <BarChart3 className="h-5 w-5 text-indigo-600" />, bg: "bg-indigo-50", title: "Real Metrics", desc: "Engagement rate, follower count, virality score — all verified by our team." },
              { icon: <Star className="h-5 w-5 text-pink-600" />, bg: "bg-pink-50", title: "Free to Join", desc: "Zero platform fees. We take nothing from your collaboration deals." },
            ].map(item => (
              <div key={item.title} className="flex gap-4 p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all">
                <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#1a0533] via-[#3b0764] to-[#6b21a8] relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-pink-600/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-500/20 rounded-full blur-[80px]" />
        </div>
        <div className="relative z-10 container mx-auto max-w-2xl text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-purple-200 mb-6">
            <Zap className="h-3.5 w-3.5" /> Get started for free
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Ready to grow together?</h2>
          <p className="text-purple-200/80 mb-10 text-lg">Join brands and creators building authentic campaigns across India.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-purple-900 hover:bg-purple-50 font-bold px-8 h-13 text-base shadow-xl"
              asChild
            >
              <Link href="/signup?type=brand">
                <Building2 className="mr-2 h-4 w-4" /> I&apos;m a Brand
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-transparent border-2 border-white/50 text-white hover:bg-white/10 hover:border-white font-bold px-8 h-13 text-base transition-all"
              asChild
            >
              <Link href="/signup?type=influencer">
                <Star className="mr-2 h-4 w-4" /> I&apos;m a Creator
              </Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
