import { useEffect, useRef, useState } from 'react'

/**
 * Animates a number from 0 to `target` once the returned ref enters viewport.
 * Returns [ref, displayValue].
 */
export function useCountUp(target, { duration = 1600, decimals = 0, start = 0 } = {}) {
  const ref = useRef(null)
  const [value, setValue] = useState(start)
  const startedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setValue(target)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true
            const t0 = performance.now()
            const ease = (t) => 1 - Math.pow(1 - t, 3)
            const tick = (now) => {
              const elapsed = now - t0
              const p = Math.min(1, elapsed / duration)
              const v = start + (target - start) * ease(p)
              setValue(decimals > 0 ? Number(v.toFixed(decimals)) : Math.round(v))
              if (p < 1) requestAnimationFrame(tick)
              else setValue(target)
            }
            requestAnimationFrame(tick)
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [target, duration, decimals, start])

  return [ref, value]
}
