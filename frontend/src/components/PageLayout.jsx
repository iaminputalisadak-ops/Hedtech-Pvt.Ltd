import { Outlet, useLocation } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'
import StructuredData from './StructuredData'
import BrandingHead from './BrandingHead'

export default function PageLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div className={`page-shell ${isHome ? 'page-shell--home' : ''}`.trim()}>
      <StructuredData />
      <BrandingHead />
      <div className="gradient-mesh" aria-hidden />
      <div className="grid-noise" aria-hidden />
      <a
        href="#main-content"
        className="skip-link"
        onClick={() => {
          document.getElementById('main-content')?.focus({ preventScroll: true })
        }}
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="site-main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
