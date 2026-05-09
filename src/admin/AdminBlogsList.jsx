import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminListBlogs, adminDeleteBlog, adminUpdateBlog } from '../api/client'

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

export default function AdminBlogsList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [filter, setFilter] = useState('')

  const load = () => {
    setLoading(true); setErr(null)
    adminListBlogs()
      .then(setItems)
      .catch(e => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const onDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    await adminDeleteBlog(id)
    load()
  }
  const toggleActive = async (it) => {
    await adminUpdateBlog(it._id, { active: !it.active })
    load()
  }

  const visible = items.filter((b) => {
    if (!filter) return true
    const f = filter.toLowerCase()
    return [b.title, b.slug, b.author, ...(b.tags || [])].filter(Boolean).some(v => String(v).toLowerCase().includes(f))
  })

  return (
    <div className="admin__page">
      <header className="admin__header">
        <div>
          <h1>Blog Posts</h1>
          <p className="admin__page-sub">Write and manage articles for /blog. Drafts can be hidden until you're ready to publish.</p>
        </div>
        <div className="admin__header-actions">
          <button className="admin__btn" onClick={load}>Refresh</button>
          <Link className="admin__btn admin__btn--primary" to="/admin/blogs/new">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Blog Post
          </Link>
        </div>
      </header>

      <input
        className="admin__search"
        placeholder="Search by title, slug, tag, author…"
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />

      {loading && <div className="admin__state">Loading…</div>}
      {err && <div className="admin__state admin__state--err">{err}</div>}

      {!loading && !err && (
        <div className="admin__table-wrap">
          <table className="admin__table">
            <thead>
              <tr>
                <th></th>
                <th>Title</th>
                <th>Author</th>
                <th>Published</th>
                <th>Tags</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((b) => (
                <tr key={b._id}>
                  <td>
                    {b.coverUrl
                      ? <img src={b.coverUrl} alt="" className="admin__thumb" />
                      : <div className="admin__thumb admin__thumb--placeholder">📖</div>}
                  </td>
                  <td>
                    <Link to={`/admin/blogs/${b._id}/edit`}>{b.title}</Link>
                    <div className="admin__sub">/blog/{b.slug}</div>
                  </td>
                  <td>{b.author || '—'}</td>
                  <td>{fmtDate(b.publishedAt || b.createdAt)}</td>
                  <td className="admin__cell-trim">{(b.tags || []).join(', ') || '—'}</td>
                  <td>
                    <span className={`admin__pill ${b.active ? 'admin__pill--ok' : 'admin__pill--off'}`}>
                      {b.active ? 'Live' : 'Draft'}
                    </span>
                  </td>
                  <td className="admin__row-actions">
                    <Link to={`/admin/blogs/${b._id}/edit`} className="admin__btn">Edit</Link>
                    <button className="admin__btn" onClick={() => toggleActive(b)}>{b.active ? 'Unpublish' : 'Publish'}</button>
                    <button className="admin__btn admin__btn--danger" onClick={() => onDelete(b._id, b.title)}>Delete</button>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan="7" className="admin__state">No blog posts yet. Click "New Blog Post" to write one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
