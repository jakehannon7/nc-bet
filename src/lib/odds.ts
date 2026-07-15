/** Converts American odds to implied win probability (0-1). */
export function americanToProb(odds: number): number {
  return odds > 0 ? 100 / (odds + 100) : -odds / (-odds + 100);
}

/** Converts an implied win probability (0-1) back to American odds. */
export function probToAmerican(prob: number): number {
  const p = Math.min(Math.max(prob, 0.001), 0.999);
  return p >= 0.5 ? -(p / (1 - p)) * 100 : ((1 - p) / p) * 100;
}

/** Converts a probability to displayable American odds, snapped to the nearest 5. */
export function probToDisplayOdds(prob: number): number {
  const am = probToAmerican(prob);
  const rounded = Math.round(am / 5) * 5;
  if (rounded > -100 && rounded < 100) return am >= 0 ? 100 : -100;
  return rounded;
}

export function formatAmericanOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`;
}

export function americanToDecimal(odds: number): number {
  return odds > 0 ? 1 + odds / 100 : 1 + 100 / -odds;
}

export function decimalToAmerican(decimal: number): number {
  const profit = decimal - 1;
  return profit >= 1 ? Math.round(profit * 100) : Math.round(-100 / profit);
}

export function nowMinutes(date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes();
}
