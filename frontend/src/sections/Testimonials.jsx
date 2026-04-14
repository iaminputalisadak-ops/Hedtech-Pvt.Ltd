import { useMemo } from 'react'
import { motion as Motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import SectionContainer from '../components/SectionContainer'
import { useSite } from '../context/SiteContext'
import LazyYouTube from '../components/LazyYouTube'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { Link } from 'react-router-dom'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import './Testimonials.css'

const DESKTOP_GRID = '(min-width: 1024px)'

function ReviewCard({ t }) {
  return (
    <article className="review-card">
      <LazyYouTube videoUrl={t.video_url} title={`Video testimonial from ${t.name}`} />
      <div className="review-card-body">
        <div className="review-stars" aria-hidden>
          {Array.from({ length: Math.min(5, Math.max(1, Number(t.rating) || 5)) }).map((_, i) => (
            <Star key={i} size={18} fill="var(--accent)" color="var(--accent)" />
          ))}
        </div>
        <h3 className="review-name">{t.name}</h3>
        <p className="review-role">{t.role}</p>
        {t.quote ? <p className="review-quote">{t.quote}</p> : null}
      </div>
    </article>
  )
}

export default function Testimonials() {
  const { testimonials, settings } = useSite()
  const reduce = useReducedMotion()
  const autoplayEnabled = (settings?.reviews_autoscroll ?? '1') === '1' && !reduce
  const isDesktop = useMediaQuery(DESKTOP_GRID)

  const n = testimonials?.length ?? 0
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

  if (!n) return null

  const desktopItems = testimonials.slice(0, 4)
  const showViewAll = n > 4

  return (
    <SectionContainer id="reviews" className="reviews-section">
      <div className="section-block-head">
        <p className="section-kicker">Testimonials</p>
        <h2 className="section-title">Client stories</h2>
        <p className="section-lead">Video testimonials and feedback from teams we have partnered with.</p>
      </div>

      <Motion.div
        initial={reduce ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {isDesktop ? (
          <div className="reviews-desktop">
            <div className="reviews-desktop-grid">
              {desktopItems.map((t) => (
                <ReviewCard key={t.id} t={t} />
              ))}
            </div>
            {showViewAll ? (
              <div className="reviews-see-more-wrap">
                <Link to="/reviews" className="reviews-see-more-btn">
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
                modules={[Autoplay, Navigation, Pagination]}
                loop={loopEnabled}
                rewind={rewindEnabled}
                speed={650}
                grabCursor
                slidesPerView={1}
                spaceBetween={16}
                breakpoints={breakpoints}
                autoplay={
                  autoplayEnabled
                    ? {
                        delay: 4200,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                      }
                    : false
                }
                pagination={{
                  clickable: true,
                  dynamicBullets: n > 6,
                }}
                navigation={{
                  prevEl: '.reviews-carousel-wrap .reviews-prev',
                  nextEl: '.reviews-carousel-wrap .reviews-next',
                }}
              >
                {testimonials.map((t) => (
                  <SwiperSlide key={t.id}>
                    <ReviewCard t={t} />
                  </SwiperSlide>
                ))}
              </Swiper>

              <div className="reviews-nav" aria-label="Carousel controls">
                <button type="button" className="reviews-nav-btn reviews-prev" aria-label="Previous reviews">
                  <ChevronLeft size={22} />
                </button>
                <button type="button" className="reviews-nav-btn reviews-next" aria-label="Next reviews">
                  <ChevronRight size={22} />
                </button>
              </div>
            </div>

            {showViewAll ? (
              <div className="reviews-see-more-wrap reviews-see-more-wrap--mobile">
                <Link to="/reviews" className="reviews-see-more-btn">
                  View all
                </Link>
              </div>
            ) : null}
          </div>
        )}
      </Motion.div>
    </SectionContainer>
  )
}
