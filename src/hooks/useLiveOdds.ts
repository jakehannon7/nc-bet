import { useEffect, useRef, useState } from "react";
import { PLAYERS, type PlayerDef } from "../data/players";
import { targetProbAt, type EffectiveProfile } from "../lib/attendance";
import { nowMinutes, probToDisplayOdds } from "../lib/odds";

const TICK_MS = 15_000;
const REVERSION = 0.25;

export type ProfileMap = Record<string, EffectiveProfile>;

export interface LiveOdds {
  player: PlayerDef;
  profile: EffectiveProfile;
  odds: number;
  direction: "up" | "down" | "flat";
}

type ProbMap = Record<string, number>;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

function initProbs(profiles: ProfileMap): ProbMap {
  const mins = nowMinutes();
  const probs: ProbMap = {};
  for (const p of PLAYERS) probs[p.id] = targetProbAt(profiles[p.id], mins);
  return probs;
}

function step(probs: ProbMap, profiles: ProfileMap): ProbMap {
  const mins = nowMinutes();
  const next: ProbMap = {};
  for (const p of PLAYERS) {
    const profile = profiles[p.id];
    const lo = Math.min(profile.peakProb, profile.capProb);
    const hi = Math.max(profile.peakProb, profile.capProb);
    const target = targetProbAt(profile, mins);
    const span = hi - lo || 0.01;
    const jitter = (Math.random() - 0.5) * 2 * span * 0.12;
    const current = probs[p.id] ?? target;
    next[p.id] = clamp(current + (target - current) * REVERSION + jitter, lo, hi);
  }
  return next;
}

/** Ticks every ~15s, drifting each player's live odds toward their time-of-day fair value. */
export function useLiveOdds(profiles: ProfileMap): LiveOdds[] {
  const profilesRef = useRef(profiles);
  profilesRef.current = profiles;
  const [probs, setProbs] = useState<ProbMap>(() => initProbs(profiles));
  const prevOddsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const id = setInterval(() => setProbs((p) => step(p, profilesRef.current)), TICK_MS);
    return () => clearInterval(id);
  }, []);

  // New attendance data reprices the board immediately instead of waiting for the next tick.
  useEffect(() => {
    setProbs((p) => step(p, profiles));
  }, [profiles]);

  return PLAYERS.map((player) => {
    const profile = profiles[player.id];
    const lo = Math.min(profile.peakProb, profile.capProb);
    const hi = Math.max(profile.peakProb, profile.capProb);
    const odds = probToDisplayOdds(clamp(probs[player.id] ?? profile.peakProb, lo, hi));
    const prev = prevOddsRef.current[player.id];
    let direction: LiveOdds["direction"] = "flat";
    if (prev != null && odds !== prev) direction = odds < prev ? "up" : "down";
    prevOddsRef.current[player.id] = odds;
    return { player, profile, odds, direction };
  });
}
