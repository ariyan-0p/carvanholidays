import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchBlog } from '../api/client'
import './Blogs.css'

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

// Lightweight content renderer:
// - if the content already contains HTML tags, render as-is
// - otherwise, split on blank lines and wrap each block in <p>
function renderContent(raw) {
  if (!raw) return ''
  const looksHtml = /<\/?[a-z][\s\S]*>/i.test(raw)
  if (looksHtml) return raw
  return raw
    .split(/\n\s*\n/)
    .map((para) => `<p>${para.replace(/\n/g, '<br/>').trim()}</p>`)
    .join('\n')
}

export default function BlogDetail() {
  const { slug } = useParams()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    setLoading(true); setErr(null)
    fetchBlog(slug)
      .then(setBlog)
      .catch((e) => setErr(e?.response?.status === 404 ? 'Blog not found' : (e?.response?.data?.error || e.message)))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="page"><div className="blogs__state">Loading…</div></div>
  if (err) return (
    <div className="page">
      <div className="blogs__state blogs__state--err">{err}</div>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Link to="/blog" className="blog-back">← Back to all blogs</Link>
      </div>
    </div>
  )
  if (!blog) return null

  return (
    <article className="blog-article">
      {blog.coverUrl && (
        <div className="blog-article__hero" style={{ backgroundImage: `url(${blog.coverUrl})` }}>
          <div className="blog-article__hero-overlay" />
        </div>
      )}

      <div className="blog-article__inner">
        <Link to="/blog" className="blog-back">← All blogs</Link>

        <header className="blog-article__head">
          {blog.tags?.length > 0 && (
            <div className="blog-article__tags">
              {blog.tags.map((t) => <span key={t} className="blog-article__tag">{t}</span>)}
            </div>
          )}
          <h1 className="blog-article__title">{blog.title}</h1>
          <div className="blog-article__meta">
            <span><strong>{blog.author || 'Carvaan Team'}</strong></span>
            <span>·</span>
            <span>{fmtDate(blog.publishedAt || blog.createdAt)}</span>
            {blog.readTime && <><span>·</span><span>{blog.readTime}</span></>}
          </div>
          {blog.excerpt && <p className="blog-article__excerpt">{blog.excerpt}</p>}
        </header>

        <div
          className="blog-article__content"
          dangerouslySetInnerHTML={{ __html: renderContent(blog.content) }}
        />
      </div>
    </article>
  )
}
