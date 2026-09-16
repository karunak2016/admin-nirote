import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { IndianRupee, ShoppingCart, Users, Package, Clock, Tag, Ticket, Star, BarChart2, Inbox, Rss, ArrowRight } from 'lucide-react'
import type { DashboardStats } from '../types'
import { dashboardApi } from '../api/dashboard'
import { StatCard } from '../components/ui/StatCard'
import { Spinner } from '../components/ui/Spinner'

const quickLinks = [
  { to: '/products/new', label: 'Add Product',        icon: Package,   color: 'bg-blue-50 text-blue-600' },
  { to: '/orders',       label: 'View Orders',        icon: ShoppingCart, color: 'bg-green-50 text-green-600' },
  { to: '/categories',   label: 'Categories',         icon: Tag,       color: 'bg-yellow-50 text-yellow-600' },
  { to: '/coupons',      label: 'Coupons',            icon: Ticket,    color: 'bg-purple-50 text-purple-600' },
  { to: '/reviews',      label: 'Reviews',            icon: Star,      color: 'bg-orange-50 text-orange-600' },
  { to: '/analytics',    label: 'Analytics',          icon: BarChart2, color: 'bg-indigo-50 text-indigo-600' },
  { to: '/contacts',     label: 'Contact Messages',   icon: Inbox,     color: 'bg-pink-50 text-pink-600' },
  { to: '/newsletter',   label: 'Subscribers',        icon: Rss,       color: 'bg-teal-50 text-teal-600' },
]

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.getStats().then(setStats).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!stats) {
    return <p className="text-gray-500">Could not load dashboard stats.</p>
  }

  const summary = stats.summary
  const monthly = stats.monthly ?? []
  const maxRevenue = Math.max(...monthly.map((m) => m.revenue), 1)

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Revenue"
          value={`₹${(summary.totalRevenue ?? 0).toLocaleString('en-IN')}`}
          icon={IndianRupee}
          color="green"
        />
        <StatCard
          title="Total Orders"
          value={summary.totalOrders ?? 0}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="Customers"
          value={summary.totalCustomers ?? 0}
          icon={Users}
          color="yellow"
        />
        <StatCard
          title="Products"
          value={summary.totalProducts ?? 0}
          icon={Package}
          color="red"
        />
        <StatCard
          title="Pending Orders"
          value={summary.pendingOrders ?? 0}
          icon={Clock}
          color="yellow"
          sub="Needs attention"
        />
      </div>

      {/* Revenue bar chart */}
      {monthly.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-6">Monthly Revenue</h2>
          <div className="flex items-end gap-3 h-40">
            {monthly.map((m) => {
              const heightPct = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0
              return (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-500">
                    ₹{m.revenue >= 1000 ? `${(m.revenue / 1000).toFixed(0)}k` : m.revenue}
                  </span>
                  <div
                    className="w-full rounded-t bg-primary-800 transition-all"
                    style={{ height: `${Math.max(heightPct, 2)}%` }}
                  />
                  <span className="text-[10px] text-gray-400">{m.month}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Orders & revenue table */}
      {monthly.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Monthly Breakdown</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {monthly.map((m) => (
                <tr key={m.month} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{m.month}</td>
                  <td className="px-6 py-3 text-right text-gray-600">{m.orders}</td>
                  <td className="px-6 py-3 text-right font-medium text-gray-900">₹{m.revenue.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Actions — always visible */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickLinks.map(({ to, label, icon: Icon, color }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
            >
              <span className={`flex-shrink-0 p-2 rounded-lg ${color}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-gray-700 flex-1">{label}</span>
              <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
