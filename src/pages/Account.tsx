import { Logo } from "../components/Logo";
import { useApp } from "../context/AppContext";

export function Account() {
  const { bankroll, bets, resetBankroll } = useApp();
  const won = bets.filter((b) => b.status === "won").length;
  const lost = bets.filter((b) => b.status === "lost").length;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div
        className="flex shrink-0 flex-col items-center gap-3 px-5 pb-8 pt-10 text-white"
        style={{ background: "linear-gradient(160deg, var(--nc-green) 0%, var(--nc-green-dark) 100%)" }}
      >
        <Logo size={56} />
        <h1 className="text-xl font-bold">NC Bet</h1>
        <p className="text-sm text-white/80">Neighborhood Club Sportsbook</p>
      </div>

      <div className="-mt-4 flex-1 rounded-t-3xl bg-[var(--nc-bg)] px-5 pb-6 pt-5">
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
          <p className="text-sm text-[var(--nc-text-muted)]">Bankroll</p>
          <p className="mt-1 text-3xl font-bold text-[var(--nc-green-dark)]">${bankroll.toLocaleString()}</p>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div>
              <p className="font-bold text-[var(--nc-text)]">{won}</p>
              <p className="text-[var(--nc-text-muted)]">Won</p>
            </div>
            <div>
              <p className="font-bold text-[var(--nc-text)]">{lost}</p>
              <p className="text-[var(--nc-text-muted)]">Lost</p>
            </div>
            <div>
              <p className="font-bold text-[var(--nc-text)]">{bets.length}</p>
              <p className="text-[var(--nc-text-muted)]">Total Bets</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm("Reset bankroll to $1,000 and clear all bet history?")) resetBankroll();
          }}
          className="mt-4 w-full rounded-xl border border-[var(--nc-red)] py-3 font-semibold text-[var(--nc-red)]"
        >
          Reset Bankroll & History
        </button>

        <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-1 font-semibold text-[var(--nc-text)]">About NC Bet</h3>
          <p className="text-sm text-[var(--nc-text-muted)]">
            A for-fun sportsbook on who shows up at the Neighborhood Club gym today. All wagers use play
            money — nothing here is real gambling.
          </p>
        </div>
      </div>
    </div>
  );
}
