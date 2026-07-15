import { useApp, type Bet } from "../context/AppContext";
import { formatAmericanOdds } from "../lib/odds";

function BetCard({ bet }: { bet: Bet }) {
  const { settleBet } = useApp();
  const isParlay = bet.legs.length > 1;
  const statusStyle =
    bet.status === "won"
      ? "bg-[var(--nc-green-pale)] text-[var(--nc-green-dark)]"
      : bet.status === "lost"
        ? "bg-red-50 text-[var(--nc-red)]"
        : "bg-amber-50 text-[var(--nc-gold)]";

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-[var(--nc-text-muted)]">
          {new Date(bet.placedAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle}`}>
          {bet.status}
        </span>
      </div>

      <div className="mb-3 flex flex-col gap-1.5">
        {bet.legs.map((leg) => (
          <div key={leg.playerId} className="flex items-center justify-between text-sm">
            <span className="font-medium text-[var(--nc-text)]">{leg.playerName}</span>
            <span className="text-[var(--nc-text-muted)]">{formatAmericanOdds(leg.odds)}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-black/5 pt-3 text-sm">
        <span className="text-[var(--nc-text-muted)]">
          {isParlay ? `${bet.legs.length}-leg parlay` : "Single"} · ${bet.wager} to win ${bet.toWin}
        </span>
        <span className="font-semibold text-[var(--nc-text)]">{formatAmericanOdds(bet.combinedOdds)}</span>
      </div>

      {bet.status === "open" && (
        <div className="mt-3 flex gap-2 border-t border-black/5 pt-3">
          <p className="flex-1 self-center text-xs text-[var(--nc-text-muted)]">
            No check-in feed yet — settle manually for now:
          </p>
          <button
            onClick={() => settleBet(bet.id, "won")}
            className="rounded-lg bg-[var(--nc-green-pale)] px-3 py-1.5 text-sm font-semibold text-[var(--nc-green-dark)]"
          >
            Mark Won
          </button>
          <button
            onClick={() => settleBet(bet.id, "lost")}
            className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-semibold text-[var(--nc-red)]"
          >
            Mark Lost
          </button>
        </div>
      )}
    </div>
  );
}

export function MyBets() {
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
            <div className="flex flex-col gap-3">
              {open.map((b) => (
                <BetCard key={b.id} bet={b} />
              ))}
            </div>
          </div>
        )}

        {settled.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--nc-text-muted)]">Settled</h2>
            <div className="flex flex-col gap-3">
              {settled.map((b) => (
                <BetCard key={b.id} bet={b} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
