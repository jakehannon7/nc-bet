import { dayKey, profileWindowLabel } from "../lib/attendance";
import { OddsPill } from "./OddsPill";
import type { LiveOdds } from "../hooks/useLiveOdds";
import { useApp } from "../context/AppContext";

function StreakChip({ streak }: { streak: number }) {
  if (streak >= 2) {
    return (
      <span className="rounded-full bg-[var(--nc-green-pale)] px-2 py-0.5 text-xs font-semibold text-[var(--nc-green-dark)]">
        Hot · {streak}d
      </span>
    );
  }
  if (streak <= -3) {
    return (
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
        Cold · {-streak}d
      </span>
    );
  }
  return null;
}

export function PlayerCard({ player, profile, odds, direction }: LiveOdds) {
  const { slip, addToSlip, removeFromSlip, days } = useApp();
  const inSlip = slip.some((l) => l.playerId === player.id);
  const today = days.find((d) => d.date === dayKey());
  const hereToday = today?.sightings.some((s) => s.playerId === player.id) ?? false;

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-[var(--nc-card)] p-4 shadow-sm">
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-semibold text-[var(--nc-text)]">{player.name}</p>
          <StreakChip streak={profile.streak} />
        </div>
        <p className="text-sm text-[var(--nc-text-muted)]">
          {profileWindowLabel(profile)}
          {hereToday && <span className="font-semibold text-[var(--nc-green-dark)]"> · Here ✓</span>}
        </p>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2">
        <OddsPill odds={odds} direction={direction} />
        <button
          onClick={() => (inSlip ? removeFromSlip(player.id) : addToSlip(player, odds))}
          disabled={hereToday}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            hereToday
              ? "bg-gray-100 text-gray-400"
              : inSlip
                ? "bg-[var(--nc-green-pale)] text-[var(--nc-green-dark)]"
                : "bg-[var(--nc-green-dark)] text-white hover:bg-[var(--nc-green)]"
          }`}
        >
          {hereToday ? "Here" : inSlip ? "Added" : "Add"}
        </button>
      </div>
    </div>
  );
}
