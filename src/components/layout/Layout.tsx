import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

const PAGE_TITLES: Record<string, string> = {
  '/':           'Dashboard',
  '/products':   'Products',
  '/categories': 'Categories',
  '/orders':     'Orders',
  '/customers':  'Customers',
  '/coupons':    'Coupons & Offers',
}

function getTitle(pathname: string) {
  if (pathname.startsWith('/products/new')) return 'Add Product'
  if (pathname.match(/\/products\/\d+\/edit/)) return 'Edit Product'
  if (pathname.match(/\/orders\/\d+/)) return 'Order Detail'
  if (pathname.match(/\/customers\/\d+/)) return 'Customer Detail'
  return PAGE_TITLES[pathname] ?? 'Admin'
}

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content — offset for fixed sidebar on desktop */}
      <div className="flex flex-1 flex-col overflow-hidden lg:pl-60">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title={getTitle(pathname)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
