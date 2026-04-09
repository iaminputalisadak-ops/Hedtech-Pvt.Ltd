import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from './context/ThemeContext'
import { SiteProvider } from './context/SiteContext'
import PageLayout from './components/PageLayout'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'

const Work = lazy(() => import('./pages/Work'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const BlogList = lazy(() => import('./pages/BlogList'))
const BlogPost = lazy(() => import('./pages/BlogPost'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const Reviews = lazy(() => import('./pages/Reviews'))
const Team = lazy(() => import('./pages/Team'))
const WebDevelopment = lazy(() => import('./pages/services/WebDevelopment'))
const SeoServices = lazy(() => import('./pages/services/SeoServices'))
const UiUx = lazy(() => import('./pages/services/UiUx'))

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ThemeProvider>
          <SiteProvider>
            <Suspense fallback={<div className="page-state page-state--center" aria-live="polite" />}>
              <Routes>
                <Route element={<PageLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/work" element={<Work />} />
                  <Route path="/work/:slug" element={<ProjectDetail />} />
                  <Route path="/blog" element={<BlogList />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/services/web-development" element={<WebDevelopment />} />
                  <Route path="/services/seo" element={<SeoServices />} />
                  <Route path="/services/ui-ux" element={<UiUx />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsPage />} />
                </Route>
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </Suspense>
          </SiteProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  )
}
