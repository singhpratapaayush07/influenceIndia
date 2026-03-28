import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@influenceindia.in" },
    update: {},
    create: {
      email: "admin@influenceindia.in",
      password: adminPassword,
      userType: "admin",
      onboardingComplete: true,
    },
  });
  console.log("Admin created:", admin.email);

  // Sample Influencers
  const influencers = [
    {
      email: "priya.sharma@example.com",
      displayName: "Priya Sharma",
      instagram: "priyasharma_",
      city: "Mumbai",
      niches: ["Fashion", "Beauty", "Lifestyle"],
      followerCount: 450000,
      engagementRate: 4.2,
      viralityScore: 75,
      bio: "Fashion and beauty creator from Mumbai. Helping brands connect with aspirational Indian women.",
      pricing: [
        { tierType: "story", priceInr: 8000 },
        { tierType: "post", priceInr: 25000 },
        { tierType: "reel", priceInr: 35000 },
      ],
    },
    {
      email: "rohit.techguy@example.com",
      displayName: "Rohit Verma",
      instagram: "rohit.techtalks",
      youtube: "RohitTechTalks",
      city: "Bangalore",
      niches: ["Tech", "Gaming", "Education"],
      followerCount: 820000,
      engagementRate: 3.8,
      viralityScore: 82,
      bio: "Tech reviewer and gadget enthusiast. Making technology accessible for everyday Indians.",
      pricing: [
        { tierType: "post", priceInr: 45000 },
        { tierType: "reel", priceInr: 60000 },
        { tierType: "video", priceInr: 150000 },
      ],
    },
    {
      email: "ananya.foodie@example.com",
      displayName: "Ananya Krishnan",
      instagram: "ananya.eats",
      city: "Chennai",
      niches: ["Food", "Travel", "Lifestyle"],
      followerCount: 320000,
      engagementRate: 5.6,
      viralityScore: 68,
      bio: "Food blogger exploring India one plate at a time. South Indian cuisine specialist.",
      pricing: [
        { tierType: "story", priceInr: 6000 },
        { tierType: "post", priceInr: 18000 },
        { tierType: "reel", priceInr: 28000 },
      ],
    },
    {
      email: "vikram.fitness@example.com",
      displayName: "Vikram Singh",
      instagram: "vikram.fitlife",
      youtube: "VikramFitLife",
      city: "Delhi",
      niches: ["Fitness", "Sports", "Lifestyle"],
      followerCount: 1200000,
      engagementRate: 3.2,
      viralityScore: 88,
      bio: "Certified fitness trainer and nutrition coach. Building India's healthiest generation.",
      pricing: [
        { tierType: "story", priceInr: 15000 },
        { tierType: "post", priceInr: 50000 },
        { tierType: "reel", priceInr: 80000 },
        { tierType: "video", priceInr: 200000 },
      ],
    },
    {
      email: "kavya.beauty@example.com",
      displayName: "Kavya Reddy",
      instagram: "kavya.glowup",
      city: "Hyderabad",
      niches: ["Beauty", "Fashion", "Photography"],
      followerCount: 280000,
      engagementRate: 6.1,
      viralityScore: 72,
      bio: "Beauty and skincare enthusiast. Honest reviews for Indian skin tones.",
      pricing: [
        { tierType: "story", priceInr: 5000 },
        { tierType: "post", priceInr: 15000 },
        { tierType: "reel", priceInr: 22000 },
      ],
    },
    {
      email: "aditya.traveller@example.com",
      displayName: "Aditya Kumar",
      instagram: "aditya.wanders",
      youtube: "AdityaWanders",
      city: "Jaipur",
      niches: ["Travel", "Photography", "Lifestyle"],
      followerCount: 680000,
      engagementRate: 4.5,
      viralityScore: 78,
      bio: "Budget travel blogger visiting every corner of incredible India.",
      pricing: [
        { tierType: "post", priceInr: 35000 },
        { tierType: "reel", priceInr: 45000 },
        { tierType: "video", priceInr: 120000 },
      ],
    },
    {
      email: "meera.finance@example.com",
      displayName: "Meera Patel",
      instagram: "meera.moneytalk",
      youtube: "MeeraMoneyTalk",
      city: "Ahmedabad",
      niches: ["Finance", "Education", "Lifestyle"],
      followerCount: 520000,
      engagementRate: 5.2,
      viralityScore: 85,
      bio: "CA and financial planner making personal finance simple for young Indians.",
      pricing: [
        { tierType: "post", priceInr: 40000 },
        { tierType: "reel", priceInr: 55000 },
        { tierType: "video", priceInr: 180000 },
      ],
    },
    {
      email: "arjun.gamer@example.com",
      displayName: "Arjun Nair",
      instagram: "arjun.gamezz",
      youtube: "ArjunGamezz",
      city: "Pune",
      niches: ["Gaming", "Entertainment", "Tech"],
      followerCount: 950000,
      engagementRate: 4.8,
      viralityScore: 91,
      bio: "Pro gamer and content creator. India's gaming community ambassador.",
      pricing: [
        { tierType: "post", priceInr: 55000 },
        { tierType: "reel", priceInr: 70000 },
        { tierType: "video", priceInr: 250000 },
      ],
    },
    {
      email: "nisha.parenting@example.com",
      displayName: "Nisha Gupta",
      instagram: "nisha.momlife",
      city: "Lucknow",
      niches: ["Parenting", "Lifestyle", "Education"],
      followerCount: 195000,
      engagementRate: 7.3,
      viralityScore: 65,
      bio: "Mom of 2, sharing honest parenting tips and family life moments.",
      pricing: [
        { tierType: "story", priceInr: 4000 },
        { tierType: "post", priceInr: 12000 },
        { tierType: "reel", priceInr: 18000 },
      ],
    },
    {
      email: "sanjay.music@example.com",
      displayName: "Sanjay Mehta",
      instagram: "sanjay.beats",
      youtube: "SanjayBeats",
      city: "Mumbai",
      niches: ["Music", "Entertainment", "Lifestyle"],
      followerCount: 750000,
      engagementRate: 5.9,
      viralityScore: 87,
      bio: "Independent musician and music producer. Creating India's next big hits.",
      pricing: [
        { tierType: "post", priceInr: 42000 },
        { tierType: "reel", priceInr: 65000 },
        { tierType: "video", priceInr: 160000 },
      ],
    },
  ];

  for (const inf of influencers) {
    const password = await bcrypt.hash("password123", 12);
    const overallScore = Math.round(
      Math.min((inf.followerCount / 1_000_000) * 40, 40) +
      Math.min(inf.engagementRate * 4, 40) +
      (inf.viralityScore / 100) * 20
    );

    const user = await prisma.user.upsert({
      where: { email: inf.email },
      update: {},
      create: {
        email: inf.email,
        password,
        userType: "influencer",
        onboardingComplete: true,
      },
    });

    const profile = await prisma.influencerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        displayName: inf.displayName,
        bio: inf.bio,
        instagramHandle: inf.instagram,
        youtubeHandle: (inf as any).youtube || null,
        city: inf.city,
        niches: inf.niches,
        languages: ["Hindi", "English"],
        followerCount: inf.followerCount,
        engagementRate: inf.engagementRate,
        viralityScore: inf.viralityScore,
        overallScore,
        isVerified: true,
      },
    });

    for (const p of inf.pricing) {
      await prisma.influencerPricing.upsert({
        where: { id: `${profile.id}-${p.tierType}` },
        update: {},
        create: {
          id: `${profile.id}-${p.tierType}`,
          influencerId: profile.id,
          tierType: p.tierType,
          priceInr: p.priceInr,
          turnaroundDays: p.tierType === "video" ? 14 : p.tierType === "reel" ? 5 : 3,
        },
      });
    }

    console.log(`Created influencer: ${inf.displayName} (score: ${overallScore})`);
  }

  // Sample brands
  const brands = [
    {
      email: "brand@myntra.com",
      companyName: "Myntra",
      industry: "Fashion & Apparel",
      website: "https://myntra.com",
      budgetRange: "2L-10L",
      description: "India's leading fashion e-commerce platform",
    },
    {
      email: "brand@mamaearth.com",
      companyName: "Mamaearth",
      industry: "Beauty & Personal Care",
      website: "https://mamaearth.in",
      budgetRange: "50k-2L",
      description: "Natural and toxin-free personal care brand",
    },
    {
      email: "brand@zepto.com",
      companyName: "Zepto",
      industry: "E-commerce / D2C",
      website: "https://zeptonow.com",
      budgetRange: "2L-10L",
      description: "10-minute grocery delivery app",
    },
  ];

  for (const brand of brands) {
    const password = await bcrypt.hash("password123", 12);
    const user = await prisma.user.upsert({
      where: { email: brand.email },
      update: {},
      create: {
        email: brand.email,
        password,
        userType: "brand",
        onboardingComplete: true,
      },
    });

    await prisma.brandProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        companyName: brand.companyName,
        industry: brand.industry,
        website: brand.website,
        budgetRange: brand.budgetRange,
        description: brand.description,
        isVerified: true,
        targetNiches: ["Fashion", "Lifestyle", "Beauty"],
      },
    });

    console.log(`Created brand: ${brand.companyName}`);
  }

  console.log("\n✅ Seeding complete!");
  console.log("\nDemo credentials:");
  console.log("Admin:       admin@influenceindia.in / admin123");
  console.log("Influencer:  priya.sharma@example.com / password123");
  console.log("Brand:       brand@myntra.com / password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
