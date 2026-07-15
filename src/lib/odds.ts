import { PLAYERS, type PlayerDef } from "../data/players";

/** Converts American odds to implied win probability (0-1). */
export function americanToProb(odds: number): number {
  return odds > 0 ? 100 / (odds + 100) : -odds / (-odds + 100);
}

/** Converts an implied win probability (0-1) back to American odds. */
export function probToAmerican(prob: number): number {
  const p = Math.min(Math.max(prob, 0.001), 0.999);
  return p >= 0.5 ? -(p / (1 - p)) * 100 : ((1 - p) / p) * 100;
}

/** Snaps American odds to the nearest 5, keeping a valid |odds| >= 100, same sign as `sign`. */
function normalizeOdds(odds: number, sign: number): number {
  const rounded = Math.round(odds / 5) * 5;
  if (sign >= 0) return Math.max(rounded, 100);
  return Math.min(rounded, -100);
}

export interface OddsBand {
  /** Best (most favorable to the bettor's confidence) odds, at the peak/median moment. */
  peakOdds: number;
  /** Worst-case odds the market drifts to away from the peak moment. */
  capOdds: number;
  peakProb: number;
  capProb: number;
}

/**
 * The peak is the exact odds given for a player. Away from the peak, odds drift toward
 * a wider (less confident) number: positive odds grow by ~20%, negative odds shrink toward
 * zero by ~25% - e.g. +150 caps out around +180, matching the reference example.
 */
export function getOddsBand(player: PlayerDef): OddsBand {
  const sign = player.baseOdds >= 0 ? 1 : -1;
  const peakOdds = player.baseOdds;
  const rawCap = peakOdds >= 0 ? peakOdds * 1.2 : peakOdds * 0.75;
  const capOdds = normalizeOdds(rawCap, sign);
  return {
    peakOdds,
    capOdds,
    peakProb: americanToProb(peakOdds),
    capProb: americanToProb(capOdds),
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/** Ease-in-out curve: 0 at t=0, 1 at t=1. */
function easeInOut(t: number): number {
  return (1 - Math.cos(t * Math.PI)) / 2;
}

/**
 * The "fair" target probability for a player at a given clock time (minutes since midnight).
 * Players with a scheduled window peak (best odds) at the window's median and relax toward
 * the capped odds at the window's edges and beyond. Players with no schedule (N/A) float
 * around their peak probability all day.
 */
export function targetProbAt(player: PlayerDef, nowMinutes: number): number {
  const { peakProb, capProb } = getOddsBand(player);
  if (player.windowStart == null || player.windowEnd == null) {
    return peakProb;
  }
  const median = (player.windowStart + player.windowEnd) / 2;
  const half = (player.windowEnd - player.windowStart) / 2;
  const dist = Math.abs(nowMinutes - median);
  const ratio = clamp(dist / half, 0, 1);
  return peakProb + (capProb - peakProb) * easeInOut(ratio);
}

export function probToDisplayOdds(prob: number, player: PlayerDef): number {
  const sign = player.baseOdds >= 0 ? 1 : -1;
  return normalizeOdds(probToAmerican(prob), sign);
}

export function formatAmericanOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`;
}

export function nowMinutes(date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function getPlayerById(id: string): PlayerDef | undefined {
  return PLAYERS.find((p) => p.id === id);
}
