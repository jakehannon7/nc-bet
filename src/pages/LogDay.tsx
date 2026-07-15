import { useMemo, useState } from "react";
import { PLAYERS } from "../data/players";
import { useApp } from "../context/AppContext";
import {
  dayKey,
  hhmmToMinutes,
  minutesToHHMM,
  minutesToLabel,
} from "../lib/attendance";
import { nowMinutes } from "../lib/odds";

function playerName(id: string): string {
  return PLAYERS.find((p) => p.id === id)?.name ?? id;
}

export function LogDay() {
  const { days, bets, logSighting, removeSighting, finalizeDay } = useApp();
  const [query, setQuery] = useState("");
  const today = dayKey();
  const record = days.find((d) => d.date === today);
  const sightings = useMemo(
    () => [...(record?.sightings ?? [])].sort((a, b) => a.time - b.time),
    [record],
  );
  const sightedIds = new Set(sightings.map((s) => s.playerId));
  const openToday = bets.filter((b) => b.status === "open" && b.date === today).length;

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PLAYERS.filter((p) => !sightedIds.has(p.id) && p.name.toLowerCase().includes(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, record]);

  const pastDays = useMemo(
    () => [...days].filter((d) => d.date !== today).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14),
    [days, today],
  );

  const handleFinalize = () => {
    const msg =
      `Finalize today's log? ${sightings.length} player${sightings.length === 1 ? "" : "s"} marked present.` +
      (openToday > 0 ? ` This settles ${openToday} open bet${openToday === 1 ? "" : "s"}.` : "") +
      " Everyone not logged counts as a no-show, and the day locks.";
    if (confirm(msg)) finalizeDay(today);
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div
        className="shrink-0 px-5 pb-5 pt-6 text-white"
        style={{ background: "linear-gradient(160deg, var(--nc-green) 0%, var(--nc-green-dark) 100%)" }}
      >
        <h1 className="text-xl font-bold">Daily Log</h1>
        <p className="mt-1 text-sm text-white/85">
          Check people in as they walk in — log as many times as you want. Finalize once the session's over.
        </p>
      </div>

      <div className="flex-1 px-5 pb-6 pt-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-[var(--nc-text)]">
              Today · {new Date().toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
            </h2>
            {record?.finalized && (
              <span className="rounded-full bg-[var(--nc-green-pale)] px-2.5 py-1 text-xs font-semibold text-[var(--nc-green-dark)]">
                Finalized
              </span>
            )}
          </div>

          {sightings.length === 0 ? (
            <p className="mb-3 text-sm text-[var(--nc-text-muted)]">No one checked in yet.</p>
          ) : (
            <div className="mb-3 flex flex-col gap-2">
              {sightings.map((s) => (
                <div key={s.playerId} className="flex items-center justify-between gap-2 rounded-xl bg-[var(--nc-bg)] px-3 py-2">
                  <p className="min-w-0 truncate font-medium text-[var(--nc-text)]">{playerName(s.playerId)}</p>
                  <div className="flex shrink-0 items-center gap-2">
                    {record?.finalized ? (
                      <span className="text-sm text-[var(--nc-text-muted)]">{minutesToLabel(s.time)}</span>
                    ) : (
                      <>
                        <input
                          type="time"
                          value={minutesToHHMM(s.time)}
                          onChange={(e) => e.target.value && logSighting(s.playerId, hhmmToMinutes(e.target.value))}
                          className="rounded-lg border border-black/10 bg-white px-2 py-1 text-sm"
                        />
                        <button
                          onClick={() => removeSighting(s.playerId)}
                          className="text-sm font-medium text-[var(--nc-red)]"
                        >
                          Undo
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!record?.finalized && (
            <>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Who just walked in?"
                className="mb-2 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 outline-none"
              />
              <div className="flex max-h-56 flex-col gap-1 overflow-y-auto">
                {candidates.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => logSighting(p.id, nowMinutes())}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-[var(--nc-green-pale)]"
                  >
                    <span className="font-medium text-[var(--nc-text)]">{p.name}</span>
                    <span className="text-sm font-semibold text-[var(--nc-green-dark)]">Here now</span>
                  </button>
                ))}
                {candidates.length === 0 && (
                  <p className="px-3 py-2 text-sm text-[var(--nc-text-muted)]">
                    {query ? `No one matches "${query}".` : "Everyone's checked in!"}
                  </p>
                )}
              </div>
              <button
                onClick={handleFinalize}
                className="mt-4 w-full rounded-xl bg-[var(--nc-green-dark)] py-3 font-bold text-white"
              >
                Finalize Day{openToday > 0 ? ` & Settle ${openToday} Bet${openToday === 1 ? "" : "s"}` : ""}
              </button>
            </>
          )}
        </div>

        {pastDays.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--nc-text-muted)]">History</h2>
            <div className="flex flex-col gap-3">
              {pastDays.map((d) => (
                <div key={d.date} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold text-[var(--nc-text)]">
                      {new Date(`${d.date}T12:00:00`).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                    {d.finalized ? (
                      <span className="text-xs text-[var(--nc-text-muted)]">
                        {d.sightings.length} showed
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          if (confirm(`Finalize ${d.date}? This locks the day and settles its bets.`))
                            finalizeDay(d.date);
                        }}
                        className="rounded-lg bg-[var(--nc-green-pale)] px-2.5 py-1 text-xs font-semibold text-[var(--nc-green-dark)]"
                      >
                        Finalize
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-[var(--nc-text-muted)]">
                    {d.sightings.length === 0
                      ? "Nobody logged."
                      : [...d.sightings]
                          .sort((a, b) => a.time - b.time)
                          .map((s) => `${playerName(s.playerId)} (${minutesToLabel(s.time)})`)
                          .join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
