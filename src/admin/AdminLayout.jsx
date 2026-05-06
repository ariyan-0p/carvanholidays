import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdminAuth } from './AdminAuth'
import './admin.css'

export default function AdminLayout() {
  const auth = useAdminAuth()
  const nav = useNavigate()

  const logout = () => { auth.logout(); nav('/admin/login') }

  return (
    <div className="admin">
      <aside className="admin__side">
        <div className="admin__brand">
          <Link to="/">Carvaan</Link>
          <span>admin</span>
        </div>
        <nav className="admin__nav">
          <NavLink to="/admin/packages" className={({isActive}) => `admin__nav-link ${isActive ? 'is-active' : ''}`}>
            Packages
          </NavLink>
          <NavLink to="/admin/packages/new" className={({isActive}) => `admin__nav-link ${isActive ? 'is-active' : ''}`}>
            New Package
          </NavLink>
        </nav>
        <div className="admin__user">
          <div className="admin__user-email">{auth?.email}</div>
          <button onClick={logout}>Logout</button>
        </div>
      </aside>
      <main className="admin__main">
        <Outlet />
      </main>
    </div>
  )
}
