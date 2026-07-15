import { useMemo, useState } from "react";
import { PlayerCard } from "../components/PlayerCard";
import { Logo } from "../components/Logo";
import type { LiveOdds } from "../hooks/useLiveOdds";

type SortMode = "odds" | "name";

export function Board({ liveOdds }: { liveOdds: LiveOdds[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("odds");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = liveOdds.filter((lo) => lo.player.name.toLowerCase().includes(q));
    return [...list].sort((a, b) =>
      sort === "odds" ? a.odds - b.odds : a.player.name.localeCompare(b.player.name),
    );
  }, [liveOdds, query, sort]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div
        className="flex shrink-0 items-center gap-3 px-5 pb-5 pt-6 text-white"
        style={{ background: "linear-gradient(160deg, var(--nc-green) 0%, var(--nc-green-dark) 100%)" }}
      >
        <Logo size={32} />
        <h1 className="text-xl font-bold">Today's Board</h1>
      </div>

      <div className="flex-1 px-5 pb-6 pt-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search players..."
          className="mb-3 w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 outline-none"
        />
        <div className="mb-4 flex gap-2">
          {(["odds", "name"] as SortMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setSort(mode)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                sort === mode ? "bg-[var(--nc-green-dark)] text-white" : "bg-white text-[var(--nc-text-muted)]"
              }`}
            >
              {mode === "odds" ? "Favorites first" : "A-Z"}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {filtered.map((lo) => (
            <PlayerCard key={lo.player.id} {...lo} />
          ))}
          {filtered.length === 0 && (
            <p className="py-10 text-center text-[var(--nc-text-muted)]">No players match "{query}".</p>
          )}
        </div>
      </div>
    </div>
  );
}
