import { useState } from "react";
import { useApp } from "../context/AppContext";
import { americanToDecimal, decimalToAmerican, formatAmericanOdds } from "../lib/odds";
import { CloseIcon, TrashIcon } from "./icons";

export function BetSlipSheet({ onClose }: { onClose: () => void }) {
  const { slip, removeFromSlip, clearSlip, placeBet, bankroll } = useApp();
  const [wager, setWager] = useState(10);
  const [justPlaced, setJustPlaced] = useState(false);

  const decimalOdds = slip.reduce((acc, leg) => acc * americanToDecimal(leg.odds), 1);
  const toWin = Math.round(wager * (decimalOdds - 1));
  const isParlay = slip.length > 1;
  const canPlace = slip.length > 0 && wager > 0 && wager <= bankroll;

  const handlePlace = () => {
    if (!canPlace) return;
    placeBet(wager);
    setJustPlaced(true);
    setTimeout(onClose, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full flex-col rounded-t-3xl bg-[var(--nc-bg)] pb-[env(safe-area-inset-bottom)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <h2 className="text-lg font-bold text-[var(--nc-text)]">Bet Slip</h2>
          <button onClick={onClose} aria-label="Close">
            <CloseIcon className="h-6 w-6 text-[var(--nc-text-muted)]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {slip.length === 0 ? (
            <p className="py-10 text-center text-[var(--nc-text-muted)]">
              Add players from the Board to build your bet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {slip.map((leg) => (
                <div key={leg.playerId} className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
                  <div>
                    <p className="font-semibold text-[var(--nc-text)]">{leg.playerName}</p>
                    <p className="text-sm text-[var(--nc-text-muted)]">To be at the gym today</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-[var(--nc-green-dark)]">{formatAmericanOdds(leg.odds)}</span>
                    <button onClick={() => removeFromSlip(leg.playerId)} aria-label="Remove">
                      <TrashIcon className="h-5 w-5 text-[var(--nc-text-muted)]" />
                    </button>
                  </div>
                </div>
              ))}
              {slip.length > 1 && (
                <button onClick={clearSlip} className="self-start text-sm font-medium text-[var(--nc-red)]">
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>

        {slip.length > 0 && (
          <div className="border-t border-black/5 px-5 py-4">
            {isParlay && (
              <p className="mb-2 text-sm font-medium text-[var(--nc-text-muted)]">
                {slip.length}-leg parlay · combined odds {formatAmericanOdds(decimalToAmerican(decimalOdds))}
              </p>
            )}
            <div className="flex items-center gap-3">
              <label className="flex-1">
                <span className="mb-1 block text-sm text-[var(--nc-text-muted)]">Wager</span>
                <div className="flex items-center rounded-xl border border-black/10 bg-white px-3 py-2">
                  <span className="text-[var(--nc-text-muted)]">$</span>
                  <input
                    type="number"
                    min={1}
                    max={bankroll}
                    value={wager}
                    onChange={(e) => setWager(Number(e.target.value))}
                    className="w-full bg-transparent px-2 py-1 font-semibold outline-none"
                  />
                </div>
              </label>
              <div className="flex-1">
                <span className="mb-1 block text-sm text-[var(--nc-text-muted)]">To win</span>
                <p className="rounded-xl bg-[var(--nc-green-pale)] px-3 py-3 text-center font-bold text-[var(--nc-green-dark)]">
                  ${toWin.toLocaleString()}
                </p>
              </div>
            </div>
            {wager > bankroll && (
              <p className="mt-2 text-sm text-[var(--nc-red)]">Wager exceeds your bankroll.</p>
            )}
            <button
              onClick={handlePlace}
              disabled={!canPlace}
              className="mt-4 w-full rounded-xl bg-[var(--nc-green-dark)] py-3 font-bold text-white disabled:opacity-40"
            >
              {justPlaced ? "Bet placed!" : "Place Bet"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
