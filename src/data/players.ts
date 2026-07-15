export interface PlayerDef {
  id: string;
  name: string;
  /** Best (peak) American odds, hit at the median of the time window. */
  baseOdds: number;
  /** Minutes since midnight the window opens, or null if no fixed schedule. */
  windowStart: number | null;
  /** Minutes since midnight the window closes, or null if no fixed schedule. */
  windowEnd: number | null;
}

const h = (hour: number, minute = 0) => hour * 60 + minute;

// All windows below are quoted in the gym's afternoon hours (12pm-5pm).
export const PLAYERS: PlayerDef[] = [
  { id: "old-head-rizzer", name: "Old Head Rizzer", baseOdds: 150, windowStart: h(12), windowEnd: h(15) },
  { id: "gloved-geezer", name: "Gloved Geezer", baseOdds: 220, windowStart: h(12), windowEnd: h(15) },
  { id: "lesbian-chick", name: "Lesbian Chick", baseOdds: -300, windowStart: h(14), windowEnd: h(16) },
  { id: "steve", name: "Steve", baseOdds: 275, windowStart: h(13), windowEnd: h(15) },
  { id: "hulk", name: "Hulk", baseOdds: 1200, windowStart: null, windowEnd: null },
  { id: "piece-guy", name: "Piece Guy", baseOdds: 500, windowStart: h(13), windowEnd: h(16) },
  { id: "cadillac-guy", name: "Cadillac Guy", baseOdds: 300, windowStart: h(14), windowEnd: h(16) },
  { id: "the-duo", name: "The Duo", baseOdds: 175, windowStart: h(13), windowEnd: h(15) },
  { id: "rocco", name: "Rocco", baseOdds: 200, windowStart: h(14), windowEnd: h(16) },
  { id: "peruskis", name: "Peruskis", baseOdds: 400, windowStart: h(13), windowEnd: h(16) },
  { id: "full-send-bob", name: "Full Send Bob", baseOdds: 625, windowStart: h(13), windowEnd: h(16) },
  { id: "worker-guy", name: "Worker Guy", baseOdds: -110, windowStart: h(12), windowEnd: h(17) },
  { id: "mario-guy", name: "Mario Guy", baseOdds: 450, windowStart: h(15), windowEnd: h(17) },
  { id: "bandana-guy", name: "Bandana Guy", baseOdds: 450, windowStart: h(14), windowEnd: h(16) },
  { id: "old-lesbian-rows", name: "Old Lesbian (Rows)", baseOdds: 180, windowStart: h(12), windowEnd: h(14) },
  { id: "old-red-head-chick", name: "Old Red Head Chick", baseOdds: 500, windowStart: h(12), windowEnd: h(15) },
  { id: "dancing-poser", name: "Dancing Poser", baseOdds: 1000, windowStart: null, windowEnd: null },
  { id: "raef", name: "Raef", baseOdds: 110, windowStart: h(16), windowEnd: h(17) },
  { id: "james-ward-clone", name: "James Ward Clone", baseOdds: 350, windowStart: h(13), windowEnd: h(15) },
  { id: "mr-paelan", name: "Mr. Paelan", baseOdds: 900, windowStart: null, windowEnd: null },
  { id: "caleb-williams", name: "Caleb Williams", baseOdds: 700, windowStart: h(14), windowEnd: h(17) },
  { id: "aaron-glenn", name: "Aaron Glenn", baseOdds: 550, windowStart: h(15), windowEnd: h(17) },
  { id: "caleb-deberry", name: "Caleb Deberry", baseOdds: 800, windowStart: null, windowEnd: null },
  { id: "glove-2-0", name: "Glove 2.0", baseOdds: 380, windowStart: h(13), windowEnd: h(16) },
  { id: "rosita", name: "Rosita", baseOdds: -200, windowStart: h(13), windowEnd: h(16) },
  { id: "harry-potter", name: "Harry Potter", baseOdds: 250, windowStart: h(15), windowEnd: h(17) },
  { id: "school-scooter", name: "School Scooter", baseOdds: 600, windowStart: null, windowEnd: null },
  { id: "rory-mcilroy", name: "Rory Mcilroy", baseOdds: 220, windowStart: h(14), windowEnd: h(16) },
  { id: "jarvis-brother", name: "Jarvis Brother", baseOdds: 145, windowStart: h(14), windowEnd: h(16) },
  { id: "tren-father-son-duo", name: "Tren Father/Son Duo", baseOdds: 200, windowStart: h(14), windowEnd: h(16) },
];

