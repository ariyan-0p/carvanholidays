import { useEffect, useRef, useState } from 'react'

/**
 * Reveals an element when it enters the viewport.
 * Returns [ref, isVisible]. Add `data-reveal` and toggle `is-visible` via the
 * shared `.reveal` CSS class, or use the helper className builder.
 */
export function useReveal({ threshold = 0.15, once = true, delay = 0 } = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delay) {
              setTimeout(() => setVisible(true), delay)
            } else {
              setVisible(true)
            }
            if (once) io.unobserve(entry.target)
          } else if (!once) {
            setVisible(false)
          }
        })
      },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, once, delay])

  return [ref, visible]
}

/** Convenience: returns a className combining base + visibility. */
export function revealClass(base, visible) {
  return `${base} reveal ${visible ? 'is-visible' : ''}`
}
