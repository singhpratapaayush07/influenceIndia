/**
 * Escrow configuration and helpers.
 * Platform fee is calculated as a percentage of the collaboration amount.
 */

export const PLATFORM_FEE_PERCENT = 10; // 10% platform commission

export function calculatePlatformFee(amountInr: number): number {
  return Math.round(amountInr * (PLATFORM_FEE_PERCENT / 100));
}

export function calculateInfluencerPayout(amountInr: number): number {
  return amountInr - calculatePlatformFee(amountInr);
}

export const ESCROW_STATUS = {
  PENDING: "pending",       // Escrow created, awaiting brand payment
  HELD: "held",             // Brand paid, funds held by platform
  RELEASED: "released",     // Funds released to influencer
  REFUNDED: "refunded",     // Funds returned to brand
  DISPUTED: "disputed",     // Under dispute — admin will resolve
} as const;

export type EscrowStatus = (typeof ESCROW_STATUS)[keyof typeof ESCROW_STATUS];

/** Auto-release window: if brand doesn't respond within 7 days of delivery, funds auto-release */
export const AUTO_RELEASE_DAYS = 7;
