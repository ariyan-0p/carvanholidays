import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { adminLogin, setToken } from '../api/client'
import { useAdminAuth } from './AdminAuth'
import logo from '../assets/logotransparent.PNG'
import './admin.css'

export default function AdminLogin() {
  const nav = useNavigate()
  const loc = useLocation()
  const auth = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setErr(null)
    try {
      const { token } = await adminLogin(email, password)
      setToken(token)
      await auth.refresh()
      const dest = loc.state?.from || '/admin/packages'
      nav(dest, { replace: true })
    } catch (e) {
      setErr(e?.response?.data?.error || 'Invalid email or password.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="adminlogin">
      {/* Left: brand panel */}
      <aside className="adminlogin__brand">
        <div className="adminlogin__brand-bg" aria-hidden="true">
          <span className="adminlogin__orb adminlogin__orb--1" />
          <span className="adminlogin__orb adminlogin__orb--2" />
          <span className="adminlogin__orb adminlogin__orb--3" />
        </div>
        <div className="adminlogin__brand-content">
          <Link to="/" className="adminlogin__logo">
            <img src={logo} alt="Carvaan Holidays" />
          </Link>
          <div>
            <span className="adminlogin__pill">Admin Console</span>
            <h2 className="adminlogin__brand-title">Welcome back.</h2>
            <p className="adminlogin__brand-sub">
              Manage packages, review enquiries, and keep travellers happy — all from one place.
            </p>
          </div>
          <ul className="adminlogin__features">
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7"/>
              </svg>
              Curate holiday packages instantly
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7"/>
              </svg>
              Track enquiries in real time
            </li>
            <li>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7"/>
              </svg>
              Update images, itineraries & prices
            </li>
          </ul>
        </div>
        <div className="adminlogin__brand-foot">
          © {new Date().getFullYear()} Carvaan Holidays
        </div>
      </aside>

      {/* Right: form panel */}
      <main className="adminlogin__form-wrap">
        <div className="adminlogin__form-inner">
          <Link to="/" className="adminlogin__back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M11 6L5 12L11 18"/>
            </svg>
            Back to site
          </Link>

          <header className="adminlogin__head">
            <h1>Sign in to your dashboard</h1>
            <p>Enter your admin credentials to continue.</p>
          </header>

          <form className="adminlogin__form" onSubmit={submit} autoComplete="off" noValidate>
            <label className="adminlogin__field">
              <span>Email</span>
              <div className="adminlogin__input-wrap">
                <svg className="adminlogin__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@carvaanholidays.com"
                  required
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </label>

            <label className="adminlogin__field">
              <span>Password</span>
              <div className="adminlogin__input-wrap">
                <svg className="adminlogin__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="adminlogin__eye"
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </label>

            {err && (
              <div className="adminlogin__error" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {err}
              </div>
            )}

            <button type="submit" className="adminlogin__submit" disabled={busy}>
              {busy ? (
                <>
                  <span className="adminlogin__spinner" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6"/>
                  </svg>
                </>
              )}
            </button>

            <p className="adminlogin__legal">
              Authorised personnel only. All actions are logged.
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}
