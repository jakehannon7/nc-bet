import type { PlayerDef } from "../data/players";
import { americanToProb } from "./odds";

export interface Sighting {
  playerId: string;
  /** Minutes since midnight when they were spotted. */
  time: number;
}

export interface DayRecord {
  /** Local YYYY-MM-DD key. */
  date: string;
  /** Finalized days settle bets and feed the odds model; open days are still being logged. */
  finalized: boolean;
  sightings: Sighting[];
}

export function dayKey(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function minutesToLabel(mins: number): string {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60);
  const mm = m % 60;
  const ap = h24 >= 12 ? "pm" : "am";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return mm === 0 ? `${h12}${ap}` : `${h12}:${String(mm).padStart(2, "0")}${ap}`;
}

export function minutesToHHMM(mins: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;
}

export function hhmmToMinutes(v: string): number {
  const [h, m] = v.split(":").map(Number);
  return h * 60 + m;
}

/** How many recent finalized days feed the model. */
const HISTORY_DAYS = 14;
/** Pseudo-days of evidence the benchmark odds are worth; more real days = benchmark matters less. */
const PRIOR_WEIGHT = 6;
/** Per-day multiplier for an active show/miss streak. */
const STREAK_BOOST = 0.05;
const MAX_STREAK = 5;

export interface EffectiveProfile {
  /** Probability at the peak (best-odds) moment. */
  peakProb: number;
  /** Probability at the worst the line is allowed to drift to. */
  capProb: number;
  /** Peak time in minutes since midnight, or null for anytime players. */
  median: number | null;
  /** Half-width of the active window in minutes. */
  halfWidth: number;
  /** Consecutive finalized days present (+) or absent (-); 0 with no history. */
  streak: number;
  /** Finalized days of history considered. */
  daysLogged: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

function medianOf(nums: number[]): number {
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/**
 * Blends the benchmark odds with logged attendance. Hit rate over the last two weeks pulls
 * the peak probability up or down, an active streak amplifies it (3 straight shows =
 * noticeably shorter odds), and logged arrival times pull the peak time toward when they
 * actually walk in.
 */
export function computeProfile(player: PlayerDef, days: DayRecord[]): EffectiveProfile {
  const finalized = days
    .filter((d) => d.finalized)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-HISTORY_DAYS);

  const present = (d: DayRecord) => d.sightings.some((s) => s.playerId === player.id);
  const hits = finalized.filter(present).length;

  const basePeak = americanToProb(player.baseOdds);
  let peakProb = (basePeak * PRIOR_WEIGHT + hits) / (PRIOR_WEIGHT + finalized.length);

  let streak = 0;
  for (let i = finalized.length - 1; i >= 0; i--) {
    const dir = present(finalized[i]) ? 1 : -1;
    if (streak === 0) streak = dir;
    else if (Math.sign(streak) === dir) streak += dir;
    else break;
  }
  peakProb *= 1 + STREAK_BOOST * clamp(streak, -MAX_STREAK, MAX_STREAK);
  peakProb = clamp(peakProb, 0.02, 0.96);
  const capProb = Math.max(peakProb * 0.9, 0.015);

  const times: number[] = [];
  for (const d of finalized) {
    const s = d.sightings.find((x) => x.playerId === player.id);
    if (s) times.push(s.time);
  }

  let median: number | null = null;
  let halfWidth = 90;
  if (player.windowStart != null && player.windowEnd != null) {
    median = (player.windowStart + player.windowEnd) / 2;
    halfWidth = (player.windowEnd - player.windowStart) / 2;
  }
  if (times.length >= 2) {
    const observed = medianOf(times);
    const w = Math.min(times.length / 6, 0.75);
    median = median == null ? observed : median * (1 - w) + observed * w;
  }

  return { peakProb, capProb, median, halfWidth, streak: finalized.length ? streak : 0, daysLogged: finalized.length };
}

/** Ease-in-out curve: 0 at t=0, 1 at t=1. */
function easeInOut(t: number): number {
  return (1 - Math.cos(t * Math.PI)) / 2;
}

/**
 * Fair probability at a given clock time: peakProb at the peak moment, relaxing to capProb
 * at the window edges and beyond. Anytime players sit at their peak all day.
 */
export function targetProbAt(profile: EffectiveProfile, nowMins: number): number {
  if (profile.median == null) return profile.peakProb;
  const dist = Math.abs(nowMins - profile.median);
  const ratio = clamp(dist / profile.halfWidth, 0, 1);
  return profile.peakProb + (profile.capProb - profile.peakProb) * easeInOut(ratio);
}

export function profileWindowLabel(profile: EffectiveProfile): string {
  if (profile.median == null) return "Anytime";
  return `${minutesToLabel(profile.median - profile.halfWidth)}–${minutesToLabel(profile.median + profile.halfWidth)}`;
}
