import { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { useLiveOdds } from "./hooks/useLiveOdds";
import { BottomNav, type Tab } from "./components/BottomNav";
import { BetSlipSheet } from "./components/BetSlipSheet";
import { Home } from "./pages/Home";
import { Board } from "./pages/Board";
import { MyBets } from "./pages/MyBets";
import { Account } from "./pages/Account";

function AppShell() {
  const [tab, setTab] = useState<Tab>("home");
  const [slipOpen, setSlipOpen] = useState(false);
  const liveOdds = useLiveOdds();
  const { slip } = useApp();

  return (
    <div className="flex h-svh flex-col bg-[var(--nc-bg)]">
      <div className="flex flex-1 flex-col overflow-hidden">
        {tab === "home" && <Home liveOdds={liveOdds} onViewBoard={() => setTab("board")} />}
        {tab === "board" && <Board liveOdds={liveOdds} />}
        {tab === "bets" && <MyBets />}
        {tab === "account" && <Account />}
      </div>

      {slip.length > 0 && !slipOpen && (
        <button
          onClick={() => setSlipOpen(true)}
          className="mx-5 mb-3 shrink-0 rounded-xl bg-[var(--nc-green-dark)] py-3 font-bold text-white shadow-lg"
        >
          View Slip ({slip.length})
        </button>
      )}

      <BottomNav active={tab} onChange={setTab} />

      {slipOpen && <BetSlipSheet onClose={() => setSlipOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
