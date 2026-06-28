const TIER_CONFIG = [
  { tier: 0, min: 0, rate: 1.0 },
  { tier: 1, min: 8000, rate: 0.98 },
  { tier: 2, min: 80000, rate: 0.95 },
  { tier: 3, min: 800000, rate: 0.9 },
];

export function getDiscountRate(totalSpent: number) {
  let currentTier = 0;
  let currentRate = 1.0;
  for (const t of TIER_CONFIG) {
    if (totalSpent >= t.min) {
      currentTier = t.tier;
      currentRate = t.rate;
    }
  }
  return { tier: currentTier, rate: currentRate };
}
