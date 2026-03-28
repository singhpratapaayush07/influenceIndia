export type UserType = "brand" | "influencer" | "admin";

export const NICHES = [
  "Fashion",
  "Beauty",
  "Tech",
  "Food",
  "Travel",
  "Fitness",
  "Lifestyle",
  "Gaming",
  "Finance",
  "Education",
  "Entertainment",
  "Sports",
  "Parenting",
  "Photography",
  "Music",
] as const;

export type Niche = (typeof NICHES)[number];

export const INDUSTRIES = [
  "Fashion & Apparel",
  "Beauty & Personal Care",
  "Food & Beverage",
  "Technology",
  "Healthcare",
  "Finance & Fintech",
  "Travel & Hospitality",
  "Education & EdTech",
  "Gaming",
  "Sports & Fitness",
  "Home & Decor",
  "Automotive",
  "Entertainment & Media",
  "E-commerce / D2C",
  "Other",
] as const;

export const CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Surat",
  "Other",
] as const;

export const BUDGET_RANGES = [
  { value: "under-10k", label: "Under ₹10K" },
  { value: "10k-50k", label: "₹10K – ₹50K" },
  { value: "50k-2L", label: "₹50K – ₹2L" },
  { value: "2L-10L", label: "₹2L – ₹10L" },
  { value: "10L+", label: "₹10L+" },
] as const;

export const TIER_TYPES = [
  { value: "story", label: "Instagram Story", icon: "📸" },
  { value: "post", label: "Feed Post (Image)", icon: "🖼️" },
  { value: "reel", label: "Instagram Reel", icon: "🎬" },
  { value: "video", label: "YouTube / Long Video", icon: "📹" },
] as const;

export interface InfluencerWithPricing {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  niches: string[];
  instagramHandle: string | null;
  youtubeHandle: string | null;
  tiktokHandle: string | null;
  followerCount: number;
  engagementRate: number;
  viralityScore: number;
  overallScore: number;
  isVerified: boolean;
  profilePictureUrl: string | null;
  city: string | null;
  languages: string[];
  pricing: {
    id: string;
    tierType: string;
    priceInr: number;
    description: string | null;
    deliverables: string | null;
    turnaroundDays: number;
  }[];
}

export interface BrandWithProfile {
  id: string;
  userId: string;
  companyName: string;
  industry: string | null;
  website: string | null;
  logoUrl: string | null;
  description: string | null;
  budgetRange: string | null;
  gstNumber: string | null;
  isVerified: boolean;
  targetNiches: string[];
}
