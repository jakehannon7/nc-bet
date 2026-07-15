import { useEffect, useState } from "react";
import { formatAmericanOdds } from "../lib/odds";
import type { LiveOdds } from "../hooks/useLiveOdds";

export function OddsPill({ odds, direction }: { odds: number; direction: LiveOdds["direction"] }) {
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (direction === "flat") return;
    setFlash(direction);
    const t = setTimeout(() => setFlash(null), 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [odds]);

  return (
    <div
      className={`flex min-w-[64px] items-center justify-center gap-1 rounded-lg border px-3 py-2 font-semibold tabular-nums transition-colors ${
        flash === "up"
          ? "flash-up border-[var(--nc-green)] text-[var(--nc-green-dark)]"
          : flash === "down"
            ? "flash-down border-[var(--nc-red)] text-[var(--nc-red)]"
            : "border-[var(--nc-green-pale)] text-[var(--nc-text)]"
      }`}
    >
      {formatAmericanOdds(odds)}
    </div>
  );
}
