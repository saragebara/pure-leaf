// Points per item cleaned
const BASE_POINTS = 10;

// Bonus thresholds
const BONUSES = [
  { threshold: 20, bonus: 50, label: 'Mega cleanup!' },
  { threshold: 10, bonus: 20, label: 'Great haul!' },
  { threshold: 5,  bonus: 10, label: 'Nice work!' },
];

export function calculatePoints(beforeCount: number, afterCount: number): {
  points: number;
  itemsCleaned: number;
  bonus: number;
  bonusLabel: string | null;
} {
  const itemsCleaned = Math.max(0, beforeCount - afterCount);
  const base = itemsCleaned * BASE_POINTS;

  let bonus = 0;
  let bonusLabel: string | null = null;
  for (const b of BONUSES) {
    if (itemsCleaned >= b.threshold) {
      bonus = b.bonus;
      bonusLabel = b.label;
      break;
    }
  }

  return {
    points: base + bonus,
    itemsCleaned,
    bonus,
    bonusLabel,
  };
}
