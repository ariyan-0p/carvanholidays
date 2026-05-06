import { createContext, useContext, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { adminMe, getToken, clearToken } from '../api/client'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [status, setStatus] = useState('loading') // loading | authed | guest
  const [email, setEmail] = useState(null)

  const refresh = async () => {
    if (!getToken()) { setStatus('guest'); setEmail(null); return }
    try {
      const me = await adminMe()
      setEmail(me.email); setStatus('authed')
    } catch {
      clearToken(); setStatus('guest'); setEmail(null)
    }
  }

  useEffect(() => { refresh() }, [])

  const logout = () => { clearToken(); setStatus('guest'); setEmail(null) }

  return (
    <AdminAuthContext.Provider value={{ status, email, refresh, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => useContext(AdminAuthContext)

export function RequireAdmin({ children }) {
  const auth = useAdminAuth()
  const loc = useLocation()
  if (!auth || auth.status === 'loading') {
    return <div className="page"><div className="page__body"><div className="page__state">Checking session…</div></div></div>
  }
  if (auth.status !== 'authed') {
    return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />
  }
  return children
}
