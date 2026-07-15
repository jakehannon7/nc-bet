# NC Bet

A for-fun sportsbook on who shows up at the Neighborhood Club gym today. Bet virtual money on
the 30 regulars, with American odds that fluctuate live throughout the day.

## How it works

Every player has a benchmark American odds value and, for most, a usual time window at the gym
(e.g. 12-3pm). Odds are best (shortest) at the peak of that window and drift toward a capped,
~10%-worse implied probability at the edges (a +150 quote caps out around +180). Players with
no fixed schedule float around their benchmark all day. Odds tick every ~15s and recompute
their fair value from the current time, plus a bounded random walk so the board feels alive.

The benchmark is only a prior: the Daily Log feeds an attendance model that reshapes each line.
Hit rate over the last two weeks moves the peak probability, an active show/miss streak
amplifies it (three straight days = noticeably shorter odds; a week of no-shows blows the line
out), and logged arrival times drag the peak time toward when they actually walk in.

The Log tab can be updated any number of times during a session — check people in as they
arrive. Confirmed players show "Here" on the board (no more betting on a lock), confirmed
parlay legs count as won for the live cashout offer (93 cents on the expected dollar), and
finalizing the day settles that day's paper-money bets: every leg logged = win, anyone
missing = loss. Bankroll, bets, and attendance history persist to `localStorage`.

## Development

```bash
npm install
npm run dev
```

```bash
npm run build   # type-check + production build
```
