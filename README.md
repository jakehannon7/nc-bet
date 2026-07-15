# NC Bet

A for-fun sportsbook on who shows up at the Neighborhood Club gym today. Bet virtual money on
the 30 regulars, with American odds that fluctuate live throughout the day.

## How it works

Every player has a base ("peak") American odds value and, for most, a usual time window at the
gym (e.g. 12-3pm). Odds are best (shortest) at the median of that window and drift toward a
wider, capped value the further you get from that time - positive odds widen by ~20%, negative
odds shrink toward zero by ~25% (so a player quoted at +150 for a 12-3pm window caps out at
+180 at the edges of that window, per spec). Players with no fixed schedule float around their
base odds all day. Odds tick every ~15s and recompute their fair value from the current time,
plus a bounded random walk so the board feels alive.

Bankroll, bet slip, and bet history persist to `localStorage`. There's no real attendance feed,
so open bets are settled manually from the My Bets tab for now.

## Development

```bash
npm install
npm run dev
```

```bash
npm run build   # type-check + production build
```
