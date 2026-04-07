import {
  Code,
  Palette,
  Search,
  TrendingUp,
  ShoppingCart,
  LifeBuoy,
  Sparkles,
  Layers,
  Cpu,
  Globe,
} from 'lucide-react'

const map = {
  code: Code,
  palette: Palette,
  search: Search,
  'trending-up': TrendingUp,
  'shopping-cart': ShoppingCart,
  'life-buoy': LifeBuoy,
  layers: Layers,
  cpu: Cpu,
  globe: Globe,
}

export function DynamicIcon({ name, size = 22, strokeWidth = 1.75 }) {
  const key = (name || 'sparkles').toLowerCase()
  const Cmp = map[key] || Sparkles
  return <Cmp size={size} strokeWidth={strokeWidth} aria-hidden />
}
