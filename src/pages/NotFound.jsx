import { Link } from 'react-router-dom'
import './pages.css'

export default function NotFound() {
  return (
    <div className="page">
      <div className="page__body" style={{ textAlign: 'center', padding: '120px 24px' }}>
        <h1 style={{ fontSize: 64 }}>404</h1>
        <p style={{ marginBottom: 24, color: 'var(--text-muted)' }}>This page wandered off the trail.</p>
        <Link to="/" className="book-box__btn">Back home</Link>
      </div>
    </div>
  )
}
