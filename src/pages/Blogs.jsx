import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchBlogs } from '../api/client'
import './Blogs.css'

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

export default function Blogs() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    fetchBlogs()
      .then(setItems)
      .catch((e) => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <div className="page__hero blogs__hero">
        <div className="page__hero-inner">
          <span className="section-tag">Travel Journal</span>
          <h1>The Carvaan Blog</h1>
          <p>Stories, tips, and inspiration from the road — straight from our travel designers and recent travellers.</p>
        </div>
      </div>

      <div className="page__body">
        {loading && <div className="blogs__state">Loading stories…</div>}
        {err && <div className="blogs__state blogs__state--err">{err}</div>}

        {!loading && !err && items.length === 0 && (
          <div className="blogs__state">No blogs yet — check back soon.</div>
        )}

        {!loading && !err && items.length > 0 && (
          <div className="blogs__grid">
            {items.map((b) => (
              <Link key={b._id} to={`/blog/${b.slug}`} className="blog-card">
                <div className="blog-card__media">
                  {b.coverUrl
                    ? <img src={b.coverUrl} alt={b.title} loading="lazy" />
                    : <div className="blog-card__placeholder">📖</div>}
                </div>
                <div className="blog-card__body">
                  <div className="blog-card__meta">
                    <span>{fmtDate(b.publishedAt || b.createdAt)}</span>
                    {b.readTime && <><span>·</span><span>{b.readTime}</span></>}
                  </div>
                  <h3 className="blog-card__title">{b.title}</h3>
                  {b.excerpt && <p className="blog-card__excerpt">{b.excerpt}</p>}
                  <div className="blog-card__footer">
                    <span className="blog-card__author">{b.author || 'Carvaan Team'}</span>
                    <span className="blog-card__read">Read more →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
