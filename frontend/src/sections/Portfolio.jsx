import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import SectionContainer from '../components/SectionContainer'
import { useSite } from '../context/SiteContext'
import { useMediaQuery } from '../hooks/useMediaQuery'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import './Testimonials.css'
import './PortfolioHome.css'

const DESKTOP_GRID = '(min-width: 1024px)'
const HOME_PORTFOLIO_PREVIEW = 4

function ProjectPreviewCard({ p }) {
  return (
    <article className="review-card project-preview-card">
      <Link
        to={`/work/${encodeURIComponent(p.slug)}`}
        className="project-preview-top"
        aria-label={`Open case study: ${p.title}`}
      >
        <div className="project-preview-top-inner">
          {p.image_url ? (
            <img
              src={p.image_url}
              alt=""
              loading="lazy"
              decoding="async"
              className={p.image_fit === 'contain' ? 'is-contain' : 'is-cover'}
            />
          ) : (
            <div className="project-preview-placeholder">Preview</div>
          )}
        </div>
        <span className="project-preview-play" aria-hidden>
          <Play size={22} fill="currentColor" strokeWidth={0} />
        </span>
      </Link>
      <div className="review-card-body">
        <div className="project-preview-meta">
          {p.category ? <span className="project-preview-category">{p.category}</span> : <span className="project-preview-category">Case study</span>}
        </div>
        <h3 className="review-name">{p.title}</h3>
        {p.excerpt ? <p className="review-role project-preview-excerpt">{p.excerpt}</p> : null}
      </div>
    </article>
  )
}

export default function Portfolio() {
  const { projects } = useSite()
  const reduce = useReducedMotion()
  const isDesktop = useMediaQuery(DESKTOP_GRID)

  const n = projects?.length ?? 0
  if (!n) return null

  const loopEnabled = n >= 4
  const rewindEnabled = !loopEnabled && n > 1

  const breakpoints = useMemo(() => {
    const count = Math.max(1, n)
    return {
      0: { slidesPerView: 1, spaceBetween: 16 },
      520: { slidesPerView: Math.min(2, count), spaceBetween: 18 },
      900: { slidesPerView: Math.min(2, count), spaceBetween: 20 },
    }
  }, [n])

  const desktopItems = projects.slice(0, HOME_PORTFOLIO_PREVIEW)
  const showViewAll = n > HOME_PORTFOLIO_PREVIEW

  return (
    <SectionContainer id="work" className="reviews-section portfolio-home-wrap">
      <div className="section-block-head">
        <p className="section-kicker">Portfolio</p>
        <h2 className="section-title">Selected projects</h2>
        <p className="section-lead">A snapshot of recent builds — interfaces, platforms, and launches we have shipped.</p>
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {isDesktop ? (
          <div className="reviews-desktop">
            <div className="reviews-desktop-grid">
              {desktopItems.map((p) => (
                <ProjectPreviewCard key={p.id} p={p} />
              ))}
            </div>
            {showViewAll ? (
              <div className="reviews-see-more-wrap">
                <Link to="/work" className="reviews-see-more-btn">
                  View all
                </Link>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="reviews-mobile">
            <div className="reviews-carousel-wrap">
              <Swiper
                className="reviews-swiper"
                modules={[Navigation, Pagination]}
                loop={loopEnabled}
                rewind={rewindEnabled}
                speed={650}
                grabCursor
                slidesPerView={1}
                spaceBetween={16}
                breakpoints={breakpoints}
                autoplay={false}
                pagination={{
                  clickable: true,
                  dynamicBullets: n > 6,
                }}
                navigation={{
                  prevEl: '.reviews-carousel-wrap .reviews-prev',
                  nextEl: '.reviews-carousel-wrap .reviews-next',
                }}
              >
                {projects.map((p) => (
                  <SwiperSlide key={p.id}>
                    <ProjectPreviewCard p={p} />
                  </SwiperSlide>
                ))}
              </Swiper>

              <div className="reviews-nav" aria-label="Carousel controls">
                <button type="button" className="reviews-nav-btn reviews-prev" aria-label="Previous projects">
                  <ChevronLeft size={22} />
                </button>
                <button type="button" className="reviews-nav-btn reviews-next" aria-label="Next projects">
                  <ChevronRight size={22} />
                </button>
              </div>
            </div>

            {showViewAll ? (
              <div className="reviews-see-more-wrap reviews-see-more-wrap--mobile">
                <Link to="/work" className="reviews-see-more-btn">
                  View all
                </Link>
              </div>
            ) : null}
          </div>
        )}
      </motion.div>
    </SectionContainer>
  )
}
