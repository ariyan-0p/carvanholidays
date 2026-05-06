import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { adminLogin, setToken } from '../api/client'
import { useAdminAuth } from './AdminAuth'
import './admin.css'

export default function AdminLogin() {
  const nav = useNavigate()
  const loc = useLocation()
  const auth = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      setErr(e?.response?.data?.error || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={submit}>
        <h1>Admin Login</h1>
        <p className="admin-login__sub">Carvaan Holidays dashboard</p>
        <label>
          Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        {err && <div className="admin-login__err">{err}</div>}
        <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  )
}
