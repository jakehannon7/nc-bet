import { useEffect, useRef, useState } from "react";
import { PLAYERS, type PlayerDef } from "../data/players";
import { getOddsBand, nowMinutes, probToDisplayOdds, targetProbAt } from "../lib/odds";

const TICK_MS = 15_000;
const REVERSION = 0.25;

export interface LiveOdds {
  player: PlayerDef;
  odds: number;
  direction: "up" | "down" | "flat";
}

type ProbMap = Record<string, number>;

function initProbs(): ProbMap {
  const mins = nowMinutes();
  const probs: ProbMap = {};
  for (const p of PLAYERS) probs[p.id] = targetProbAt(p, mins);
  return probs;
}

function step(probs: ProbMap): ProbMap {
  const mins = nowMinutes();
  const next: ProbMap = {};
  for (const p of PLAYERS) {
    const band = getOddsBand(p);
    const lo = Math.min(band.peakProb, band.capProb);
    const hi = Math.max(band.peakProb, band.capProb);
    const target = targetProbAt(p, mins);
    const span = hi - lo || 0.01;
    const jitter = (Math.random() - 0.5) * 2 * span * 0.12;
    const current = probs[p.id] ?? target;
    const nudged = current + (target - current) * REVERSION + jitter;
    next[p.id] = Math.min(Math.max(nudged, lo), hi);
  }
  return next;
}

/** Ticks every ~15s, drifting each player's live odds toward their time-of-day fair value. */
export function useLiveOdds(): LiveOdds[] {
  const [probs, setProbs] = useState<ProbMap>(initProbs);
  const prevOddsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const id = setInterval(() => setProbs(step), TICK_MS);
    return () => clearInterval(id);
  }, []);

  return PLAYERS.map((player) => {
    const odds = probToDisplayOdds(probs[player.id], player);
    const prev = prevOddsRef.current[player.id];
    let direction: LiveOdds["direction"] = "flat";
    if (prev != null && odds !== prev) direction = odds < prev ? "up" : "down";
    prevOddsRef.current[player.id] = odds;
    return { player, odds, direction };
  });
}
