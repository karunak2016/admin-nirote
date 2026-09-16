import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Package, Tag, ShoppingCart, Users, X, Ticket, Sliders,
  Settings, Megaphone, Star, RotateCcw, BarChart2, ChevronDown, ChevronRight,
  Layout, Image, Navigation2, MessageSquare, HelpCircle, FileText, Search,
  Palette, Globe, MapPin, Bell, Mail, Layers, Instagram, Footprints, Inbox, Rss, Home, Store,
} from 'lucide-react'
import { cn } from '../../utils/cn'

const mainLinks = [
  { to: '/',           label: 'Dashboard',  icon: LayoutDashboard, end: true },
  { to: '/analytics',  label: 'Analytics',  icon: BarChart2 },
  { to: '/products',   label: 'Products',   icon: Package },
  { to: '/categories', label: 'Categories', icon: Tag },
  { to: '/orders',     label: 'Orders',     icon: ShoppingCart },
  { to: '/customers',  label: 'Customers',  icon: Users },
  { to: '/coupons',    label: 'Coupons',    icon: Ticket },
  { to: '/options',    label: 'Options',    icon: Sliders },
  { to: '/campaigns',  label: 'Campaigns',  icon: Megaphone },
  { to: '/reviews',    label: 'Reviews',    icon: Star },
  { to: '/returns',    label: 'Returns',    icon: RotateCcw },
  { to: '/contacts',   label: 'Messages',   icon: Inbox },
  { to: '/newsletter', label: 'Subscribers', icon: Rss },
  { to: '/settings',   label: 'Settings',   icon: Settings },
]

const cmsLinks = [
  { to: '/cms/identity',       label: 'Store Identity',    icon: Store },
  { to: '/cms/homepage',       label: 'Homepage Content',  icon: Home },
  { to: '/cms/sections',       label: 'Section Order',     icon: Layout },
  { to: '/cms/banners',        label: 'Banners',           icon: Image },
  { to: '/cms/navigation',     label: 'Navigation',        icon: Navigation2 },
  { to: '/cms/collections',    label: 'Collections',       icon: Layers },
  { to: '/cms/testimonials',   label: 'Testimonials',      icon: MessageSquare },
  { to: '/cms/why-choose-us',  label: 'Why Choose Us',     icon: Star },
  { to: '/cms/instagram',      label: 'Instagram',         icon: Instagram },
  { to: '/cms/faq',            label: 'FAQ',               icon: HelpCircle },
  { to: '/cms/policies',       label: 'Policies',          icon: FileText },
  { to: '/cms/seo',            label: 'SEO Settings',      icon: Search },
  { to: '/cms/theme',          label: 'Theme',             icon: Palette },
  { to: '/cms/about',          label: 'About Page',        icon: Globe },
  { to: '/cms/contact',        label: 'Contact Page',      icon: MapPin },
  { to: '/cms/footer',         label: 'Footer',            icon: Footprints },
  { to: '/cms/popups',         label: 'Popups',            icon: Bell },
  { to: '/cms/email-templates',label: 'Email Templates',   icon: Mail },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const [cmsOpen, setCmsOpen] = useState(false)

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-30 flex h-full w-60 flex-col bg-gray-900 text-white transition-transform duration-200 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-gray-700 flex-shrink-0">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Admin Panel</p>
            <p className="text-sm font-bold text-white">Niroté</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {/* Main */}
          {mainLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                )
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}

          {/* CMS Accordion */}
          <div className="pt-2">
            <button
              onClick={() => setCmsOpen(!cmsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-widest hover:text-gray-400 transition-colors"
            >
              <span>Content (CMS)</span>
              {cmsOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>

            {cmsOpen && (
              <div className="space-y-0.5">
                {cmsLinks.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary-800 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                      )
                    }
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-700 flex-shrink-0">
          <p className="text-xs text-gray-500">© 2026 Niroté</p>
        </div>
      </aside>
    </>
  )
}
