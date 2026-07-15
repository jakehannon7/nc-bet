import { useMemo } from "react";
import { Header } from "../components/Header";
import { PlayerCard } from "../components/PlayerCard";
import { useApp } from "../context/AppContext";
import type { LiveOdds } from "../hooks/useLiveOdds";
import { nowMinutes } from "../lib/odds";

export function Home({ liveOdds, onViewBoard }: { liveOdds: LiveOdds[]; onViewBoard: () => void }) {
  const { bets } = useApp();
  const openBets = bets.filter((b) => b.status === "open");

  const liveNow = useMemo(() => {
    const mins = nowMinutes();
    return liveOdds
      .filter(({ profile }) => profile.median != null && Math.abs(mins - profile.median) <= profile.halfWidth)
      .sort((a, b) => a.odds - b.odds)
      .slice(0, 6);
  }, [liveOdds]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <Header title="Hi, Jake!" subtitle="Who's showing up at the gym today?" />
      <div className="-mt-4 flex-1 rounded-t-3xl bg-[var(--nc-bg)] px-5 pb-6 pt-5">
        {openBets.length > 0 && (
          <div className="mb-5 flex items-center justify-between rounded-2xl bg-[var(--nc-green-pale)] px-4 py-3">
            <p className="text-sm font-medium text-[var(--nc-green-dark)]">
              You have {openBets.length} open bet{openBets.length > 1 ? "s" : ""}
            </p>
          </div>
        )}

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--nc-text)]">Live Now</h2>
          <button onClick={onViewBoard} className="text-sm font-semibold text-[var(--nc-green-dark)]">
            View Board &gt;
          </button>
        </div>

        {liveNow.length === 0 ? (
          <p className="rounded-2xl bg-white p-4 text-sm text-[var(--nc-text-muted)] shadow-sm">
            No one's scheduled window is active right now. Check the full board for anytime players.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {liveNow.map((lo) => (
              <PlayerCard key={lo.player.id} {...lo} />
            ))}
          </div>
        )}

        <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-1 font-semibold text-[var(--nc-text)]">How odds work</h3>
          <p className="text-sm text-[var(--nc-text-muted)]">
            Each regular gets best odds at the middle of their usual window, then odds drift longer the
            further you are from that time. Your daily logs move the lines too: show up a few days in a
            row and the odds shorten around your usual walk-in time; disappear for a week and they blow
            out. Log who's at the gym from the Log tab, then finalize the day to settle bets.
          </p>
        </div>
      </div>
    </div>
  );
}
