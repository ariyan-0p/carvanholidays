import { useEffect, useState } from 'react'
import './FloatingContact.css'

const PHONE    = '+919131978160'
const WHATSAPP = '919131978160'
const WA_MSG   = 'Hi! I want to plan a trip with Carvaan Holidays.'

/**
 * Floating WhatsApp + Call buttons fixed bottom-right.
 * Only shown on phones / narrow tablets, fades in once the user has
 * scrolled past the hero so it doesn't fight the hero CTA.
 */
export default function FloatingContact() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 240)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={`fc ${visible ? 'fc--visible' : ''}`} aria-hidden={!visible}>
      <a
        href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(WA_MSG)}`}
        target="_blank"
        rel="noreferrer"
        className="fc__btn fc__btn--wa"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.1.55 4.05 1.5 5.74L2 22l4.49-1.59a9.9 9.9 0 005.55 1.69h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.87 9.87 0 0012.04 2zm0 18.18a8.27 8.27 0 01-4.21-1.15l-.3-.18-3.13 1.1 1.13-3.05-.2-.31a8.24 8.24 0 011.27-10.34 8.25 8.25 0 0111.66 0 8.25 8.25 0 010 11.66 8.21 8.21 0 01-6.22 2.27zm4.53-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.15.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.39.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.06s.89 2.39 1.01 2.55c.12.17 1.74 2.66 4.22 3.73.59.26 1.05.41 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"/>
        </svg>
      </a>
      <a
        href={`tel:${PHONE}`}
        className="fc__btn fc__btn--call"
        aria-label="Call Carvaan Holidays"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0122 16.92z"/>
        </svg>
      </a>
    </div>
  )
}
