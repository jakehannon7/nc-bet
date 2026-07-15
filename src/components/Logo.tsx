export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
      <path
        d="M100 8 L188 84 V180 A8 8 0 0 1 180 188 H20 A8 8 0 0 1 12 180 V84 Z"
        fill="#2f5d44"
      />
      <circle cx="100" cy="118" r="46" fill="#8fb996" />
      <circle cx="100" cy="118" r="46" fill="none" stroke="#2f5d44" strokeWidth="6" strokeDasharray="10 10.5" />
      <circle cx="100" cy="118" r="30" fill="#2f5d44" />
      <path
        d="M100 100 c-8 0 -12 5 -12 11 0 14 24 10 24 22 0 6 -5 11 -12 11 -6 0 -10 -3 -12 -7 M100 96 v8 M100 140 v6"
        stroke="#8fb996"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
