/**
 * Calculates composite influencer score (0–100)
 * Followers: 40pts | Engagement: 40pts | Virality: 20pts
 */
export function calculateScore(
  followerCount: number,
  engagementRate: number, // percentage e.g. 3.5
  viralityScore: number   // 0-100
): number {
  const followerScore = Math.min((followerCount / 1_000_000) * 40, 40);
  const engagementScore = Math.min(engagementRate * 4, 40); // 10% = max 40pts
  const viralComponent = (viralityScore / 100) * 20;
  return Math.round(followerScore + engagementScore + viralComponent);
}

export function getScoreColor(score: number): string {
  if (score >= 71) return "text-green-600 bg-green-50 border-green-200";
  if (score >= 41) return "text-yellow-600 bg-yellow-50 border-yellow-200";
  return "text-red-600 bg-red-50 border-red-200";
}

export function getScoreLabel(score: number): string {
  if (score >= 71) return "Top";
  if (score >= 41) return "Rising";
  return "New";
}

export function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K`;
  return count.toString();
}

export function formatPrice(priceInr: number): string {
  if (priceInr >= 100_000) return `₹${(priceInr / 100_000).toFixed(1)}L`;
  if (priceInr >= 1_000) return `₹${(priceInr / 1_000).toFixed(0)}K`;
  return `₹${priceInr}`;
}
