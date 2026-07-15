import { useApp, type Bet } from "../context/AppContext";
import type { LiveOdds } from "../hooks/useLiveOdds";
import { dayKey } from "../lib/attendance";
import { americanToProb, formatAmericanOdds } from "../lib/odds";

/** House keeps a slice of expected value on early cashouts, like a real book. */
const CASHOUT_MARGIN = 0.93;

function BetCard({ bet, liveOdds }: { bet: Bet; liveOdds: LiveOdds[] }) {
  const { settleBet, cashOut, days } = useApp();
  const today = dayKey();
  const isParlay = bet.legs.length > 1;

  const todayRecord = days.find((d) => d.date === bet.date);
  const sighted = new Set(todayRecord?.sightings.map((s) => s.playerId) ?? []);

  let cashout: { value: number; confirmed: number } | null = null;
  if (bet.status === "open" && bet.date === today) {
    const potential = bet.wager + bet.toWin;
    let prob = 1;
    let confirmed = 0;
    for (const leg of bet.legs) {
      if (sighted.has(leg.playerId)) {
        confirmed++;
      } else {
        const live = liveOdds.find((lo) => lo.player.id === leg.playerId);
        prob *= live ? americanToProb(live.odds) : americanToProb(leg.odds);
      }
    }
    cashout = { value: Math.max(1, Math.round(potential * prob * CASHOUT_MARGIN)), confirmed };
  }

  const statusLabel = bet.status === "cashed" ? `Cashed $${bet.cashedFor}` : bet.status;
  const statusStyle =
    bet.status === "won"
      ? "bg-[var(--nc-green-pale)] text-[var(--nc-green-dark)]"
      : bet.status === "lost"
        ? "bg-red-50 text-[var(--nc-red)]"
        : bet.status === "cashed"
          ? "bg-[var(--nc-green-pale)] text-[var(--nc-green-dark)]"
          : "bg-amber-50 text-[var(--nc-gold)]";

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-[var(--nc-text-muted)]">
          {new Date(bet.placedAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle}`}>
          {statusLabel}
        </span>
      </div>

      <div className="mb-3 flex flex-col gap-1.5">
        {bet.legs.map((leg) => {
          const legHit = sighted.has(leg.playerId);
          return (
            <div key={leg.playerId} className="flex items-center justify-between text-sm">
              <span className="font-medium text-[var(--nc-text)]">
                {leg.playerName}
                {bet.status === "open" && legHit && (
                  <span className="ml-1.5 font-semibold text-[var(--nc-green-dark)]">✓ here</span>
                )}
              </span>
              <span className="text-[var(--nc-text-muted)]">{formatAmericanOdds(leg.odds)}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-black/5 pt-3 text-sm">
        <span className="text-[var(--nc-text-muted)]">
          {isParlay ? `${bet.legs.length}-leg parlay` : "Single"} · ${bet.wager} to win ${bet.toWin}
        </span>
        <span className="font-semibold text-[var(--nc-text)]">{formatAmericanOdds(bet.combinedOdds)}</span>
      </div>

      {cashout && (
        <div className="mt-3 flex items-center gap-3 border-t border-black/5 pt-3">
          <p className="flex-1 text-xs text-[var(--nc-text-muted)]">
            {cashout.confirmed > 0
              ? `${cashout.confirmed} of ${bet.legs.length} leg${bet.legs.length > 1 ? "s" : ""} confirmed — settles fully when you finalize the day.`
              : "Settles when you finalize today's log."}
          </p>
          <button
            onClick={() => {
              if (confirm(`Cash out now for $${cashout!.value}?`)) cashOut(bet.id, cashout!.value);
            }}
            className="shrink-0 rounded-lg bg-[var(--nc-green-dark)] px-3 py-2 text-sm font-bold text-white"
          >
            Cash Out ${cashout.value}
          </button>
        </div>
      )}

      {bet.status === "open" && bet.date < today && (
        <div className="mt-3 flex gap-2 border-t border-black/5 pt-3">
          <p className="flex-1 self-center text-xs text-[var(--nc-text-muted)]">
            From {bet.date} — finalize that day in the Log tab, or settle manually:
          </p>
          <button
            onClick={() => settleBet(bet.id, "won")}
            className="rounded-lg bg-[var(--nc-green-pale)] px-3 py-1.5 text-sm font-semibold text-[var(--nc-green-dark)]"
          >
            Won
          </button>
          <button
            onClick={() => settleBet(bet.id, "lost")}
            className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-semibold text-[var(--nc-red)]"
          >
            Lost
          </button>
        </div>
      )}
    </div>
  );
}

export function MyBets({ liveOdds }: { liveOdds: LiveOdds[] }) {
  const { bets } = useApp();
  const open = bets.filter((b) => b.status === "open");
  const settled = bets.filter((b) => b.status !== "open");

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div
        className="shrink-0 px-5 pb-5 pt-6 text-white"
        style={{ background: "linear-gradient(160deg, var(--nc-green) 0%, var(--nc-green-dark) 100%)" }}
      >
        <h1 className="text-xl font-bold">My Bets</h1>
      </div>

      <div className="flex-1 px-5 pb-6 pt-4">
        {bets.length === 0 && (
          <p className="py-10 text-center text-[var(--nc-text-muted)]">
            No bets yet. Head to the Board and add someone to your slip.
          </p>
        )}

        {open.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--nc-text-muted)]">Open</h2>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {open.map((b) => (
                <BetCard key={b.id} bet={b} liveOdds={liveOdds} />
              ))}
            </div>
          </div>
        )}

        {settled.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--nc-text-muted)]">Settled</h2>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {settled.map((b) => (
                <BetCard key={b.id} bet={b} liveOdds={liveOdds} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
