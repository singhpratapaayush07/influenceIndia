import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { InfluencerCard } from "@/components/influencer/InfluencerCard";
import { NICHES } from "@/types";
import { ArrowRight, ArrowUpRight } from "lucide-react";
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

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center bg-[#0d0118] overflow-hidden -mt-16 pt-16">
        {/* Background texture / gradient orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-purple-900/40 rounded-full blur-[160px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-900/30 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-indigo-900/20 rounded-full blur-[100px]" />
        </div>

        {/* Subtle grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)", backgroundSize: "60px 60px" }}
        />

        <div className="relative z-10 container mx-auto max-w-6xl px-6 py-24 text-center">

          {/* Eyebrow pill */}
          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-4 py-1.5 text-xs font-medium text-purple-300 mb-10 backdrop-blur-sm tracking-widest uppercase">
            🇮🇳 &nbsp;India&apos;s Influencer Marketplace
          </div>

          {/* Main headline — editorial serif italic */}
          <h1 className="font-serif text-6xl md:text-8xl lg:text-[96px] text-white leading-[1.05] tracking-tight mb-8">
            Connect Brands<br />
            <em className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-300 to-pink-400 not-italic font-bold">
              with India&apos;s<br />Top Creators
            </em>
          </h1>

          {/* Subtext */}
          <p className="text-white/50 text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed font-light">
            Verified influencers. Real metrics. Transparent pricing.
            <br />Fashion, Tech, Food, Fitness — and every niche in between.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Button
              size="lg"
              className="rounded-full px-8 h-12 bg-white text-gray-900 hover:bg-gray-100 font-semibold text-sm shadow-2xl shadow-purple-900/50"
              asChild
            >
              <Link href="/influencers">
                Browse Influencers <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="rounded-full px-8 h-12 bg-transparent border border-white/20 text-white hover:bg-white/10 hover:border-white/40 font-medium text-sm transition-all"
              asChild
            >
              <Link href="/signup?type=influencer">
                Join as a Creator
              </Link>
            </Button>
          </div>

          {/* Stats row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {[
              { value: `${totalInfluencers}+`, label: "Verified Creators" },
              { value: `${totalBrands}+`, label: "Active Brands" },
              { value: "₹0", label: "Platform Fee" },
              { value: "48h", label: "Avg. Verification" },
            ].map(stat => (
              <div key={stat.label} className="px-10 py-4 text-center">
                <div className="text-3xl font-bold text-white font-serif">{stat.value}</div>
                <div className="text-xs text-white/40 mt-1 tracking-wider uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── TRUSTED BY ───────────────────────────────────── */}
      <section className="py-14 px-6 border-b border-gray-100">
        <div className="container mx-auto max-w-5xl">
          <p className="text-center text-xs font-semibold tracking-[0.2em] text-gray-300 uppercase mb-8">
            Built for brands like
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12">
            {["Myntra", "Mamaearth", "Zepto", "boAt", "Nykaa"].map(brand => (
              <span key={brand} className="text-gray-200 font-bold text-2xl tracking-tight select-none">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR BRANDS ───────────────────────────────────── */}
      <section className="py-28 px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-purple-500 uppercase mb-3">For Brands</p>
              <h2 className="font-serif text-5xl md:text-6xl text-gray-900 leading-tight">
                Find the right<br /><em>influencer in minutes</em>
              </h2>
            </div>
            <Button
              variant="outline"
              className="rounded-full border-gray-300 text-gray-700 hover:border-purple-400 hover:text-purple-700 self-start md:self-auto"
              asChild
            >
              <Link href="/signup?type=brand">Start for free <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
            {[
              { num: "01", title: "Browse & Filter", desc: "Search by niche, city, follower count, engagement rate, and budget. Smart filters to find the perfect match." },
              { num: "02", title: "Verified Metrics", desc: "Every influencer is manually verified. Real follower counts, real engagement rates, and transparent ₹ pricing." },
              { num: "03", title: "Collab in One Click", desc: "Choose story, post, reel, or video — send a request directly. No middlemen, no commissions." },
            ].map(item => (
              <div key={item.num} className="bg-white p-8 hover:bg-purple-50/50 transition-colors">
                <div className="text-5xl font-serif font-bold text-gray-100 mb-6">{item.num}</div>
                <h3 className="font-semibold text-gray-900 text-lg mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR CREATORS ─────────────────────────────────── */}
      <section className="py-28 px-6 bg-[#faf9ff]">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-purple-500 uppercase mb-3">For Creators</p>
              <h2 className="font-serif text-5xl md:text-6xl text-gray-900 leading-tight">
                Get discovered by<br /><em>top Indian brands</em>
              </h2>
            </div>
            <Button
              variant="outline"
              className="rounded-full border-gray-300 text-gray-700 hover:border-purple-400 hover:text-purple-700 self-start md:self-auto"
              asChild
            >
              <Link href="/signup?type=influencer">Join for free <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: "01", title: "Build Your Profile", desc: "Add social handles, niche, bio and set your pricing for stories, posts, reels and long-form videos." },
              { num: "02", title: "Get Verified", desc: "Our team reviews your profile within 48 hours. Once approved you go live on the marketplace." },
              { num: "03", title: "Earn from Collabs", desc: "Brands discover you and send requests. Accept deals that match your value. Zero commission." },
            ].map(item => (
              <div key={item.num} className="relative bg-white rounded-2xl p-8 border border-purple-100 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-100/50 transition-all">
                <div className="text-5xl font-serif font-bold text-purple-100 mb-6">{item.num}</div>
                <h3 className="font-semibold text-gray-900 text-lg mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXPLORE BY NICHE ─────────────────────────────── */}
      <section className="py-28 px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="font-serif text-5xl md:text-6xl text-gray-900 mb-4">
              Explore by <em>Niche</em>
            </h2>
            <p className="text-gray-400 text-base">Top creators across every category in India</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {NICHES.slice(0, 15).map(niche => (
              <Link
                key={niche}
                href={`/influencers?niches=${niche}`}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 bg-white hover:border-purple-400 hover:bg-purple-50 hover:shadow-md transition-all"
              >
                <span className="text-base">{NICHE_ICONS[niche] || "⭐"}</span>
                <span className="text-sm font-medium text-gray-600 group-hover:text-purple-700 transition-colors">{niche}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED INFLUENCERS ─────────────────────────── */}
      {featuredInfluencers.length > 0 && (
        <section className="py-28 px-6 bg-[#0d0118]">
          <div className="container mx-auto max-w-5xl">
            <div className="flex items-end justify-between mb-14">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-purple-400 uppercase mb-3">Featured</p>
                <h2 className="font-serif text-5xl md:text-6xl text-white leading-tight">
                  Top <em>Creators</em>
                </h2>
                <p className="text-white/40 mt-2 text-sm">Verified talent with the highest ratings</p>
              </div>
              <Button
                variant="outline"
                className="rounded-full border-white/20 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/40 hidden sm:flex"
                asChild
              >
                <Link href="/influencers">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredInfluencers.map(inf => (
                <InfluencerCard key={inf.id} influencer={inf} />
              ))}
            </div>
            <div className="text-center mt-10 sm:hidden">
              <Button variant="outline" className="rounded-full border-white/20 text-white" asChild>
                <Link href="/influencers">View all influencers <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ── WHY INFLUENCEINDIA ───────────────────────────── */}
      <section className="py-28 px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-5xl md:text-6xl text-gray-900">
              Why <em>InfluenceIndia?</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { icon: "✓", label: "bg-green-50 text-green-700", title: "Verified Only", desc: "Every influencer is manually reviewed. No fake followers, no inflated metrics." },
              { icon: "₹", label: "bg-yellow-50 text-yellow-700", title: "Transparent Pricing", desc: "See exact pricing upfront. Story, post, reel, video — all clearly listed." },
              { icon: "🇮🇳", label: "bg-orange-50 text-orange-700", title: "Made for India", desc: "Designed for the Indian market — cities, languages, regional niches." },
              { icon: "⚡", label: "bg-blue-50 text-blue-700", title: "Fast Onboarding", desc: "Create your profile in minutes. Go live within 48 hours of verification." },
              { icon: "📊", label: "bg-purple-50 text-purple-700", title: "Real Metrics", desc: "Engagement rate, follower count, virality score — all verified by our team." },
              { icon: "★", label: "bg-pink-50 text-pink-700", title: "Free to Join", desc: "Zero platform fees. We take nothing from your collaboration deals." },
            ].map(item => (
              <div key={item.title} className="p-7 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold mb-5 ${item.label}`}>
                  {item.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────── */}
      <section className="py-28 px-6 bg-[#0d0118] relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-purple-900/40 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-fuchsia-900/30 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 container mx-auto max-w-2xl text-center text-white">
          <h2 className="font-serif text-5xl md:text-7xl leading-tight mb-6">
            Ready to<br /><em className="text-fuchsia-300">grow together?</em>
          </h2>
          <p className="text-white/40 text-lg mb-12 font-light">
            Join brands and creators building authentic campaigns across India.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="rounded-full px-9 h-12 bg-white text-gray-900 hover:bg-gray-100 font-semibold text-sm shadow-2xl"
              asChild
            >
              <Link href="/signup?type=brand">I&apos;m a Brand</Link>
            </Button>
            <Button
              size="lg"
              className="rounded-full px-9 h-12 bg-transparent border border-white/20 text-white hover:bg-white/10 hover:border-white/40 font-medium text-sm transition-all"
              asChild
            >
              <Link href="/signup?type=influencer">I&apos;m a Creator</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
