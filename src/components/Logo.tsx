export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-lg border-2 border-ink bg-yellow shadow-[var(--shadow-hard-sm)]"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/evalio.svg" alt="" width={size - 10} height={size - 10} />
    </span>
  );
}
