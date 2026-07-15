import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { PlayerDef } from "../data/players";

const STARTING_BANKROLL = 1000;
const STORAGE_KEY = "ncbet.state.v1";

export interface SlipLeg {
  playerId: string;
  playerName: string;
  odds: number;
}

export interface Bet {
  id: string;
  placedAt: number;
  legs: SlipLeg[];
  wager: number;
  combinedOdds: number;
  toWin: number;
  status: "open" | "won" | "lost";
  settledAt?: number;
}

interface PersistedState {
  bankroll: number;
  bets: Bet[];
}

interface AppState extends PersistedState {
  slip: SlipLeg[];
  addToSlip: (player: PlayerDef, odds: number) => void;
  removeFromSlip: (playerId: string) => void;
  clearSlip: () => void;
  placeBet: (wager: number) => void;
  settleBet: (betId: string, result: "won" | "lost") => void;
  resetBankroll: () => void;
}

const AppContext = createContext<AppState | null>(null);

function americanToDecimal(odds: number): number {
  return odds > 0 ? 1 + odds / 100 : 1 + 100 / -odds;
}

function decimalToAmerican(decimal: number): number {
  const profit = decimal - 1;
  return profit >= 1 ? Math.round(profit * 100) : Math.round(-100 / profit);
}

function loadPersisted(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PersistedState;
  } catch {
    // ignore malformed storage
  }
  return { bankroll: STARTING_BANKROLL, bets: [] };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [{ bankroll, bets }, setPersisted] = useState<PersistedState>(loadPersisted);
  const [slip, setSlip] = useState<SlipLeg[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ bankroll, bets }));
  }, [bankroll, bets]);

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
    const combinedOdds = decimalToAmerican(decimalOdds);
    const toWin = Math.round(wager * (decimalOdds - 1));
    const bet: Bet = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      placedAt: Date.now(),
      legs: slip,
      wager,
      combinedOdds,
      toWin,
      status: "open",
    };
    setPersisted((prev) => ({ bankroll: prev.bankroll - wager, bets: [bet, ...prev.bets] }));
    clearSlip();
  };

  const settleBet = (betId: string, result: "won" | "lost") => {
    setPersisted((prev) => {
      const bet = prev.bets.find((b) => b.id === betId);
      if (!bet || bet.status !== "open") return prev;
      const payout = result === "won" ? bet.wager + bet.toWin : 0;
      return {
        bankroll: prev.bankroll + payout,
        bets: prev.bets.map((b) => (b.id === betId ? { ...b, status: result, settledAt: Date.now() } : b)),
      };
    });
  };

  const resetBankroll = () => setPersisted({ bankroll: STARTING_BANKROLL, bets: [] });

  const value = useMemo<AppState>(
    () => ({ bankroll, bets, slip, addToSlip, removeFromSlip, clearSlip, placeBet, settleBet, resetBankroll }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bankroll, bets, slip],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
