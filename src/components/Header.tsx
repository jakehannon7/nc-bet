import { Logo } from "./Logo";
import { useApp } from "../context/AppContext";

export function Header({ title, subtitle }: { title: string; subtitle: string }) {
  const { bankroll } = useApp();
  return (
    <header
      className="shrink-0 px-5 pb-8 pt-6 text-white"
      style={{ background: "linear-gradient(160deg, var(--nc-green) 0%, var(--nc-green-dark) 100%)" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-bold">{title}</p>
          <p className="mt-1 text-sm text-white/85">{subtitle}</p>
        </div>
        <Logo size={44} />
      </div>
      <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 backdrop-blur-sm">
        <span className="text-sm text-white/80">Bankroll</span>
        <span className="text-lg font-bold tabular-nums">
          ${bankroll.toLocaleString()}
        </span>
      </div>
    </header>
  );
}
