/**
 * SeaWaves — three drifting wave layers that sit at the bottom of a `.sea` hero.
 * The front wave is painted in the colour of the section below it, so the hero
 * "melts" into the page instead of ending on a hard line.
 *
 * Each layer is a long repeating sine-like path (period 1200 units) inside an SVG
 * that is 300% as wide as the hero; sliding it left by exactly one third moves it
 * one full period, so the loop is seamless. The phase offset gives each layer its
 * own starting position. Animation lives in globals.css (.sea-waves) and is
 * disabled for reduced motion.
 */
const PERIOD = 1200

/** `periods` repeats of the wave, starting at x = -PERIOD so any phase shift stays covered. */
function wavePath(periods = 5) {
  let d = `M${-PERIOD} 70`
  for (let i = 0; i < periods; i++) {
    const x = -PERIOD + i * PERIOD
    d += `C${x + 150} 30 ${x + 350} 30 ${x + 600} 70S${x + 1050} 110 ${x + PERIOD} 70`
  }
  return `${d}V120H${-PERIOD}Z`
}
const WAVE = wavePath()

export function SeaWaves({ next = 'var(--color-surface-raised)' }: { next?: string }) {
  return (
    <div className="sea-waves" aria-hidden="true">
      <svg className="w1" viewBox="0 0 3600 120" preserveAspectRatio="none">
        <path d={WAVE} fill="rgb(42 171 226 / 0.20)" transform="translate(-200 -16)" />
      </svg>
      <svg className="w2" viewBox="0 0 3600 120" preserveAspectRatio="none">
        <path d={WAVE} fill="rgb(255 255 255 / 0.10)" transform="translate(-600 -4)" />
      </svg>
      <svg className="w3" viewBox="0 0 3600 120" preserveAspectRatio="none">
        <path d={WAVE} fill={next} transform="translate(-900 10)" />
      </svg>
    </div>
  )
}
