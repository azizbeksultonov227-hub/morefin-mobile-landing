// Morefin's twelve-point star, drawn instead of shipped as a picture
const STAR = Array.from({ length: 24 }, (_, i) => {
  const a = (i * Math.PI) / 12;
  const r = i % 2 ? 4.4 : 10;
  return `${(12 + r * Math.sin(a)).toFixed(2)},${(12 - r * Math.cos(a)).toFixed(2)}`;
}).join(" ");

export function MorefinMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <polygon points={STAR} fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-lg font-semibold tracking-tight ${className}`}>
      <MorefinMark className="size-7 text-primary" />
      Morefin
    </span>
  );
}
