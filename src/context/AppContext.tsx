import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { PlayerDef } from "../data/players";
import { dayKey, type DayRecord } from "../lib/attendance";
import { americanToDecimal, decimalToAmerican } from "../lib/odds";

const STARTING_BANKROLL = 1000;
const STORAGE_KEY = "ncbet.state.v2";
const LEGACY_KEY = "ncbet.state.v1";

export interface SlipLeg {
  playerId: string;
  playerName: string;
  odds: number;
}

export interface Bet {
  id: string;
  placedAt: number;
  /** Day the bet is for (YYYY-MM-DD); settles when that day's log is finalized. */
  date: string;
  legs: SlipLeg[];
  wager: number;
  combinedOdds: number;
  toWin: number;
  status: "open" | "won" | "lost" | "cashed";
  settledAt?: number;
  cashedFor?: number;
}

interface PersistedState {
  bankroll: number;
  bets: Bet[];
  days: DayRecord[];
}

interface AppState extends PersistedState {
  slip: SlipLeg[];
  addToSlip: (player: PlayerDef, odds: number) => void;
  removeFromSlip: (playerId: string) => void;
  clearSlip: () => void;
  placeBet: (wager: number) => void;
  settleBet: (betId: string, result: "won" | "lost") => void;
  cashOut: (betId: string, amount: number) => void;
  logSighting: (playerId: string, time: number) => void;
  removeSighting: (playerId: string) => void;
  finalizeDay: (date: string) => void;
  resetBankroll: () => void;
}

const AppContext = createContext<AppState | null>(null);

function loadPersisted(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PersistedState;
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const v1 = JSON.parse(legacy) as { bankroll: number; bets: Omit<Bet, "date">[] };
      return {
        bankroll: v1.bankroll,
        bets: v1.bets.map((b) => ({ ...b, date: dayKey(new Date(b.placedAt)) })),
        days: [],
      };
    }
  } catch {
    // ignore malformed storage
  }
  return { bankroll: STARTING_BANKROLL, bets: [], days: [] };
}

function settleAgainstDay(bets: Bet[], day: DayRecord): { bets: Bet[]; payout: number } {
  const sighted = new Set(day.sightings.map((s) => s.playerId));
  let payout = 0;
  const settled = bets.map((b) => {
    if (b.status !== "open" || b.date !== day.date) return b;
    const won = b.legs.every((leg) => sighted.has(leg.playerId));
    if (won) payout += b.wager + b.toWin;
    return { ...b, status: won ? ("won" as const) : ("lost" as const), settledAt: Date.now() };
  });
  return { bets: settled, payout };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [{ bankroll, bets, days }, setPersisted] = useState<PersistedState>(loadPersisted);
  const [slip, setSlip] = useState<SlipLeg[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ bankroll, bets, days }));
  }, [bankroll, bets, days]);

  const addToSlip = (player: PlayerDef, odds: number) => {
    setSlip((s) => {
      if (s.some((l) => l.playerId === player.id)) return s;
      return [...s, { playerId: player.id, playerName: player.name, odds }];
    });
  };

  const removeFromSlip = (playerId: string) => {
    setSlip((s) => s.filter((l) => l.playerId !== playerId));
  };

  const clearSlip = () => setSlip([]);

  const placeBet = (wager: number) => {
    if (slip.length === 0 || wager <= 0 || wager > bankroll) return;
    const decimalOdds = slip.reduce((acc, leg) => acc * americanToDecimal(leg.odds), 1);
    const bet: Bet = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      placedAt: Date.now(),
      date: dayKey(),
      legs: slip,
      wager,
      combinedOdds: decimalToAmerican(decimalOdds),
      toWin: Math.round(wager * (decimalOdds - 1)),
      status: "open",
    };
    setPersisted((prev) => ({ ...prev, bankroll: prev.bankroll - wager, bets: [bet, ...prev.bets] }));
    clearSlip();
  };

  const settleBet = (betId: string, result: "won" | "lost") => {
    setPersisted((prev) => {
      const bet = prev.bets.find((b) => b.id === betId);
      if (!bet || bet.status !== "open") return prev;
      const payout = result === "won" ? bet.wager + bet.toWin : 0;
      return {
        ...prev,
        bankroll: prev.bankroll + payout,
        bets: prev.bets.map((b) => (b.id === betId ? { ...b, status: result, settledAt: Date.now() } : b)),
      };
    });
  };

  const cashOut = (betId: string, amount: number) => {
    setPersisted((prev) => {
      const bet = prev.bets.find((b) => b.id === betId);
      if (!bet || bet.status !== "open") return prev;
      return {
        ...prev,
        bankroll: prev.bankroll + amount,
        bets: prev.bets.map((b) =>
          b.id === betId ? { ...b, status: "cashed" as const, settledAt: Date.now(), cashedFor: amount } : b,
        ),
      };
    });
  };

  const logSighting = (playerId: string, time: number) => {
    const today = dayKey();
    setPersisted((prev) => {
      const existing = prev.days.find((d) => d.date === today);
      if (existing?.finalized) return prev;
      const record: DayRecord = existing ?? { date: today, finalized: false, sightings: [] };
      const sightings = [
        ...record.sightings.filter((s) => s.playerId !== playerId),
        { playerId, time },
      ];
      const updated = { ...record, sightings };
      return {
        ...prev,
        days: existing ? prev.days.map((d) => (d.date === today ? updated : d)) : [...prev.days, updated],
      };
    });
  };

  const removeSighting = (playerId: string) => {
    const today = dayKey();
    setPersisted((prev) => {
      const existing = prev.days.find((d) => d.date === today);
      if (!existing || existing.finalized) return prev;
      return {
        ...prev,
        days: prev.days.map((d) =>
          d.date === today ? { ...d, sightings: d.sightings.filter((s) => s.playerId !== playerId) } : d,
        ),
      };
    });
  };

  const finalizeDay = (date: string) => {
    setPersisted((prev) => {
      const record = prev.days.find((d) => d.date === date) ?? { date, finalized: false, sightings: [] };
      if (record.finalized) return prev;
      const finalizedRecord = { ...record, finalized: true };
      const { bets: settledBets, payout } = settleAgainstDay(prev.bets, finalizedRecord);
      const hasRecord = prev.days.some((d) => d.date === date);
      return {
        bankroll: prev.bankroll + payout,
        bets: settledBets,
        days: hasRecord ? prev.days.map((d) => (d.date === date ? finalizedRecord : d)) : [...prev.days, finalizedRecord],
      };
    });
  };

  const resetBankroll = () => setPersisted({ bankroll: STARTING_BANKROLL, bets: [], days: [] });

  const value = useMemo<AppState>(
    () => ({
      bankroll,
      bets,
      days,
      slip,
      addToSlip,
      removeFromSlip,
      clearSlip,
      placeBet,
      settleBet,
      cashOut,
      logSighting,
      removeSighting,
      finalizeDay,
      resetBankroll,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bankroll, bets, days, slip],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
