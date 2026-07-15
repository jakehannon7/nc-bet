import { formatWindow } from "../data/players";
import { OddsPill } from "./OddsPill";
import type { LiveOdds } from "../hooks/useLiveOdds";
import { useApp } from "../context/AppContext";

export function PlayerCard({ player, odds, direction }: LiveOdds) {
  const { slip, addToSlip, removeFromSlip } = useApp();
  const inSlip = slip.some((l) => l.playerId === player.id);

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--nc-card)] p-4 shadow-sm">
      <div className="min-w-0">
        <p className="truncate font-semibold text-[var(--nc-text)]">{player.name}</p>
        <p className="text-sm text-[var(--nc-text-muted)]">{formatWindow(player)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <OddsPill odds={odds} direction={direction} />
        <button
          onClick={() => (inSlip ? removeFromSlip(player.id) : addToSlip(player, odds))}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            inSlip
              ? "bg-[var(--nc-green-pale)] text-[var(--nc-green-dark)]"
              : "bg-[var(--nc-green-dark)] text-white hover:bg-[var(--nc-green)]"
          }`}
        >
          {inSlip ? "Added" : "Add"}
        </button>
      </div>
    </div>
  );
}
