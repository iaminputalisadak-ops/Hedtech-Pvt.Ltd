export const homeSections = [
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'expertise', label: 'Expertise' },
  { id: 'reviews', label: 'Reviews' },
]

export const pathNav = [
  { to: '/work', label: 'Work' },
  { to: '/blog', label: 'Blog' },
]

export function navPillStyle(isActive) {
  return {
    padding: '0.45rem 0.75rem',
    borderRadius: 999,
    fontSize: '0.9rem',
    fontWeight: 500,
    color: 'var(--muted)',
    background: isActive ? 'var(--surface-strong)' : 'transparent',
  }
}
