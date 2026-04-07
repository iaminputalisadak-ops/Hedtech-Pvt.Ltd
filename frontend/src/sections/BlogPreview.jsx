import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import SectionContainer from '../components/SectionContainer'
import { useSite } from '../context/SiteContext'

const fadeIn = (reduce) => (reduce ? false : { opacity: 0 })

export default function BlogPreview() {
  const { blog } = useSite()
  const reduce = useReducedMotion()
  const posts = blog.slice(0, 3)

  return (
    <SectionContainer id="blog">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">Insights</h2>
          <p className="section-lead">SEO-friendly articles on performance, UX, and growth — managed from your admin panel.</p>
        </div>
        <Link to="/blog" className="btn btn-ghost">
          All articles <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="blog-preview-grid">
        {posts.map((post, i) => (
          <motion.article
            key={post.id}
            className="glass blog-card"
            initial={fadeIn(reduce)}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          >
            <span className="blog-card__category">{post.category}</span>
            <h3>{post.title}</h3>
            <p className="blog-card__excerpt">{post.excerpt}</p>
            <Link to={`/blog/${encodeURIComponent(post.slug)}`} className="btn btn-ghost blog-card__link">
              Read more →
            </Link>
          </motion.article>
        ))}
      </div>
    </SectionContainer>
  )
}
