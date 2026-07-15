import { BoardIcon, HomeIcon, TicketIcon, TrophyIcon } from "./icons";

export type Tab = "home" | "board" | "bets" | "account";

const TABS: { id: Tab; label: string; Icon: typeof HomeIcon }[] = [
  { id: "home", label: "Home", Icon: HomeIcon },
  { id: "board", label: "Board", Icon: BoardIcon },
  { id: "bets", label: "My Bets", Icon: TicketIcon },
  { id: "account", label: "Progress", Icon: TrophyIcon },
];

export function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="flex shrink-0 items-center justify-around border-t border-black/5 bg-white px-2 pb-[env(safe-area-inset-bottom)] pt-2">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex flex-1 flex-col items-center gap-1 py-1.5 text-xs font-medium"
          >
            <Icon className={`h-6 w-6 ${isActive ? "text-[var(--nc-green-dark)]" : "text-gray-400"}`} />
            <span className={isActive ? "text-[var(--nc-green-dark)]" : "text-gray-400"}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
