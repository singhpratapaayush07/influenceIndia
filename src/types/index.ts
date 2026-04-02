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
  isFeatured: boolean;
  profilePictureUrl: string | null;
  city: string | null;
  languages: string[];
  gender: string | null;
  ageRange: string | null;
  primaryLanguage: string | null;
  responseRate: number | null;
  avgResponseTime: number | null;
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

export const CONTENT_TYPES = [
  { value: "post", label: "Feed Post", icon: "🖼️" },
  { value: "reel", label: "Reel/Short", icon: "🎬" },
  { value: "story", label: "Story", icon: "📸" },
  { value: "video", label: "Long Video", icon: "📹" },
] as const;

export const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-Binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
] as const;

export const AGE_RANGES = [
  { value: "18-24", label: "18-24" },
  { value: "25-34", label: "25-34" },
  { value: "35-44", label: "35-44" },
  { value: "45+", label: "45+" },
] as const;

export const LANGUAGES = [
  "Hindi",
  "English",
  "Tamil",
  "Telugu",
  "Bengali",
  "Marathi",
  "Gujarati",
  "Kannada",
  "Malayalam",
  "Punjabi",
] as const;

export interface CampaignWithDetails {
  id: string;
  brandProfileId: string;
  title: string;
  description: string;
  budget: number;
  targetNiches: string[];
  targetCities: string[] | null;
  minFollowers: number | null;
  maxFollowers: number | null;
  contentTypes: string[];
  status: string;
  createdAt: Date;
  expiresAt: Date | null;
  updatedAt: Date;
  brandProfile: {
    companyName: string;
    logoUrl: string | null;
    isVerified: boolean;
  };
  proposals?: CampaignProposalWithInfluencer[];
}

export interface CampaignProposalWithInfluencer {
  id: string;
  campaignId: string;
  influencerProfileId: string;
  proposedPrice: number;
  message: string | null;
  deliverables: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  influencerProfile: {
    displayName: string;
    profilePictureUrl: string | null;
    followerCount: number;
    overallScore: number;
  };
}

export interface MessageWithUsers {
  id: string;
  requestId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  sender: {
    userType: string;
  };
  receiver: {
    userType: string;
  };
}

export type EscrowStatus = "pending" | "held" | "released" | "refunded" | "disputed";

export interface EscrowPaymentData {
  id: string;
  contactRequestId: string;
  amountInr: number;
  platformFeeInr: number;
  status: EscrowStatus;
  paidAt: string | null;
  releasedAt: string | null;
  deliverableProof: string | null;
  disputeReason: string | null;
  razorpayOrderId: string | null;
}
