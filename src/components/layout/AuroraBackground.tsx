/**
 * Fixed, decorative aurora gradients behind every page.
 * The glows are plain radial gradients (already soft), with no CSS blur filter:
 * animating a blurred layer drops to single-digit frame rates without a GPU.
 */
export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg">
      <div
        className="absolute -left-[20%] -top-[30%] h-[70vh] w-[70vw] animate-aurora-drift rounded-full opacity-40 will-change-transform"
        style={{ background: 'radial-gradient(closest-side, rgb(var(--water) / 0.5), rgb(var(--water) / 0.12) 55%, transparent)' }}
      />
      <div
        className="absolute -right-[15%] top-[10%] h-[60vh] w-[55vw] animate-aurora-drift rounded-full opacity-35 will-change-transform [animation-delay:-8s]"
        style={{ background: 'radial-gradient(closest-side, rgb(var(--rain) / 0.5), rgb(var(--rain) / 0.12) 55%, transparent)' }}
      />
      <div
        className="absolute -bottom-[30%] left-[25%] h-[60vh] w-[60vw] animate-aurora-drift rounded-full opacity-30 will-change-transform [animation-delay:-15s]"
        style={{ background: 'radial-gradient(closest-side, rgb(var(--aqua) / 0.5), rgb(var(--aqua) / 0.12) 55%, transparent)' }}
      />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgb(var(--line) / 0.5) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--line) / 0.5) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)',
        }}
      />
    </div>
  );
}
