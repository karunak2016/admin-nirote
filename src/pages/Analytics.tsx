import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Eye, ShoppingBag, IndianRupee, Users, Download, ExternalLink, X, Globe, User } from 'lucide-react'
import { analyticsApi } from '../api/analytics'
import { Spinner } from '../components/ui/Spinner'
import { downloadAnalyticsExcel } from '../utils/exportExcel'

const PERIODS = [
  { label: '7 days',  value: 7  },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
]

const SOURCE_COLORS: Record<string, string> = {
  Google:      '#4285F4',
  Instagram:   '#E1306C',
  Facebook:    '#1877F2',
  YouTube:     '#FF0000',
  'Twitter/X': '#1DA1F2',
  WhatsApp:    '#25D366',
  Direct:      '#6B7280',
}

function sourceColor(s: string) {
  return SOURCE_COLORS[s] ?? '#9CA3AF'
}

function fillDays(count: number, data: any[], dateKey: string, valueKey: string) {
  const map: Record<string, number> = {}
  data.forEach(d => { map[d[dateKey]?.toString().slice(0, 10)] = Number(d[valueKey] ?? 0) })
  const out: { date: string; value: number }[] = []
  for (let i = count - 1; i >= 0; i--) {
    const dt = new Date()
    dt.setDate(dt.getDate() - i)
    const key = dt.toISOString().slice(0, 10)
    out.push({ date: key, value: map[key] ?? 0 })
  }
  return out
}

// ── Chart components ──────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null
  const max = Math.max(...data, 1)
  const W = 80, H = 24
  const pts = data
    .map((v, i) =>
      `${((i / (data.length - 1)) * W).toFixed(1)},${(H - (v / max) * H * 0.85 - 1).toFixed(1)}`
    )
    .join(' ')
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function BarChart({ data, color, zeroColor }: {
  data: { date: string; value: number }[]
  color: string
  zeroColor: string
}) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-[3px] h-32 overflow-hidden">
      {data.map((d) => {
        const hPct = Math.max((d.value / max) * 100, d.value > 0 ? 4 : 1)
        const label = new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        const showLabel =
          data.length <= 14 ||
          new Date(d.date).getDate() === 1 ||
          d.date === data[data.length - 1].date
        return (
          <div key={d.date}
            className="group flex flex-1 flex-col items-center justify-end h-full gap-1 min-w-0">
            <div className="relative w-full flex justify-center items-end h-full">
              {d.value > 0 && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap z-10">
                  {d.value}
                </div>
              )}
              <div className="w-full rounded-t-sm"
                style={{ height: `${hPct}%`, backgroundColor: d.value > 0 ? color : zeroColor }} />
            </div>
            {showLabel && (
              <span className="text-[8px] text-gray-400 truncate w-full text-center">{label}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function AreaChart({ data, color }: { data: { date: string; value: number }[]; color: string }) {
  const n = data.length
  const max = Math.max(...data.map(d => d.value), 1)
  const W = 1000, H = 80
  if (n < 2) {
    return (
      <div className="h-24 flex items-center justify-center">
        <span className="text-xs text-gray-400">No data yet</span>
      </div>
    )
  }
  const pts = data.map((d, i) => ({
    x: parseFloat(((i / (n - 1)) * W).toFixed(2)),
    y: parseFloat((H - (d.value / max) * H * 0.88 - 4).toFixed(2)),
  }))
  const line = pts.map(p => `${p.x},${p.y}`).join(' ')
  const fill = `${pts[0].x},${H} ${line} ${pts[n - 1].x},${H}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24" preserveAspectRatio="none">
      <polygon points={fill} fill={color} fillOpacity="0.12" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  )
}

function DonutChart({ segments, total }: {
  segments: { source: string; views: number }[]
  total: number
}) {
  const r = 40, cx = 60, cy = 60
  const circ = 2 * Math.PI * r
  let cumArc = 0
  const segs = segments.map(t => {
    const arc = (t.views / total) * circ
    const seg = { source: t.source, arc, offset: circ - cumArc }
    cumArc += arc
    return seg
  })
  return (
    <svg width={120} height={120} viewBox="0 0 120 120" className="shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth="16" />
      {segs.map(s => (
        <circle key={s.source} cx={cx} cy={cy} r={r} fill="none"
          stroke={sourceColor(s.source)}
          strokeWidth="16"
          strokeDasharray={`${s.arc.toFixed(2)} ${(circ - s.arc).toFixed(2)}`}
          strokeDashoffset={s.offset.toFixed(2)}
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }} />
      ))}
    </svg>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function Analytics() {
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)
  const [summary, setSummary]         = useState<any>(null)
  const [dailyViews, setDailyViews]   = useState<any[]>([])
  const [dailyOrders, setDailyOrders] = useState<any[]>([])
  const [dailyRevenue, setDailyRevenue] = useState<any[]>([])
  const [topViews, setTopViews]       = useState<any[]>([])
  const [topSales, setTopSales]       = useState<any[]>([])
  const [traffic, setTraffic]         = useState<any[]>([])
  const [viewerModal, setViewerModal] = useState<{ productId: number; productName: string } | null>(null)
  const [viewers, setViewers]         = useState<any[]>([])
  const [viewersLoading, setViewersLoading] = useState(false)

  async function openViewers(productId: number, productName: string) {
    setViewerModal({ productId, productName })
    setViewers([])
    setViewersLoading(true)
    try {
      const data = await analyticsApi.productViewers(productId, days)
      setViewers(data)
    } finally {
      setViewersLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([
      analyticsApi.summary(days),
      analyticsApi.dailyViews(days),
      analyticsApi.dailyOrders(days),
      analyticsApi.dailyRevenue(days),
      analyticsApi.topByViews(days),
      analyticsApi.topBySales(days),
      analyticsApi.trafficSources(days),
    ]).then(([s, dv, dor, drv, tv, ts, tr]) => {
      setSummary(s)
      setDailyViews(dv)
      setDailyOrders(dor)
      setDailyRevenue(drv)
      setTopViews(tv)
      setTopSales(ts)
      setTraffic(tr)
    }).finally(() => setLoading(false))
  }, [days])

  const filledViews   = useMemo(() => fillDays(days, dailyViews,   'viewDate',    'views'),   [days, dailyViews])
  const filledOrders  = useMemo(() => fillDays(days, dailyOrders,  'orderDate',   'orders'),  [days, dailyOrders])
  const filledBuyers  = useMemo(() => fillDays(days, dailyOrders,  'orderDate',   'buyers'),  [days, dailyOrders])
  const filledRevenue = useMemo(() => fillDays(days, dailyRevenue, 'revenueDate', 'revenue'), [days, dailyRevenue])

  const totalTraffic = traffic.reduce((s: number, r: any) => s + r.views, 0) || 1
  const normalizedTraffic = traffic.map((t: any) => ({ ...t, source: t.source ?? 'Direct' }))

  function handleDownload() {
    downloadAnalyticsExcel({
      days,
      summary,
      filledViews,
      filledOrders,
      filledRevenue,
      topViews,
      topSales,
      traffic: normalizedTraffic,
    })
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>

  const revDates = [filledRevenue[0], filledRevenue[Math.floor(filledRevenue.length / 2)], filledRevenue[filledRevenue.length - 1]]

  return (
    <div className="space-y-6">
      {/* Header + period selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track views, sales, and traffic sources</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
            {PERIODS.map(p => (
              <button key={p.value} onClick={() => setDays(p.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${days === p.value ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-600 bg-green-600 text-white text-sm font-medium hover:bg-green-700 hover:border-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Stat cards with sparklines */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <AnalyticsStat icon={<Eye className="h-5 w-5 text-purple-600" />}
          label="Product Views" value={summary?.totalViews ?? 0}
          sub={`${summary?.allTimeViews ?? 0} all-time`} bg="bg-purple-50"
          sparkData={filledViews.map(d => d.value)} sparkColor="#7C3AED" />
        <AnalyticsStat icon={<ShoppingBag className="h-5 w-5 text-blue-600" />}
          label="Orders" value={summary?.totalOrders ?? 0}
          sub={`last ${days} days`} bg="bg-blue-50"
          sparkData={filledOrders.map(d => d.value)} sparkColor="#2563EB" />
        <AnalyticsStat icon={<IndianRupee className="h-5 w-5 text-green-600" />}
          label="Revenue" value={`₹${Number(summary?.totalRevenue ?? 0).toLocaleString('en-IN')}`}
          sub={`last ${days} days`} bg="bg-green-50"
          sparkData={filledRevenue.map(d => d.value)} sparkColor="#16A34A" />
        <AnalyticsStat icon={<Users className="h-5 w-5 text-amber-600" />}
          label="Buyers" value={summary?.uniqueCustomers ?? 0}
          sub={`last ${days} days`} bg="bg-amber-50"
          sparkData={filledBuyers.map(d => d.value)} sparkColor="#D97706" />
      </div>

      {/* Views + Orders bar charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-5">Daily Product Views</h2>
          <BarChart data={filledViews} color="#7C3AED" zeroColor="#EDE9FE" />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-5">Daily Orders</h2>
          <BarChart data={filledOrders} color="#2563EB" zeroColor="#DBEAFE" />
        </div>
      </div>

      {/* Revenue area chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">Daily Revenue</h2>
        <p className="text-xs text-gray-400 mb-3">₹ — last {days} days, cancelled orders excluded</p>
        <AreaChart data={filledRevenue} color="#16A34A" />
        <div className="flex justify-between mt-1">
          {revDates.filter(Boolean).map(d => (
            <span key={d!.date} className="text-[10px] text-gray-400">
              {new Date(d!.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          ))}
        </div>
      </div>

      {/* Traffic donut + Most Viewed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-5">Traffic Sources</h2>
          {normalizedTraffic.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No traffic data yet.</p>
          ) : (
            <div className="flex items-center gap-6">
              <DonutChart segments={normalizedTraffic} total={totalTraffic} />
              <div className="flex-1 space-y-3 min-w-0">
                {normalizedTraffic.map((t: any) => {
                  const pct = Math.round((t.views / totalTraffic) * 100)
                  const color = sourceColor(t.source)
                  return (
                    <div key={t.source}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="flex items-center gap-1.5 font-medium text-gray-800 min-w-0">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <span className="truncate">{t.source}</span>
                        </span>
                        <span className="text-gray-500 text-xs shrink-0 ml-2">{t.views} · {pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Most Viewed Products</h2>
            <span className="text-xs text-gray-400">last {days} days</span>
          </div>
          {topViews.length === 0 ? (
            <p className="text-sm text-gray-400 p-6 text-center">No views yet.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-50">
                {topViews.map((p: any, i: number) => (
                  <tr key={p.id} className="hover:bg-purple-50 group">
                    <td className="px-4 py-2.5 text-gray-400 w-8 text-center font-medium">{i + 1}</td>
                    <td className="px-2 py-2.5">
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt="" className="h-8 w-8 rounded object-cover" />
                        : <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center text-gray-300 text-xs">{p.name?.[0]}</div>
                      }
                    </td>
                    <td className="px-2 py-2.5 text-gray-800 font-medium truncate max-w-[140px]">
                      <Link to={`/products/${p.id}/edit`} className="hover:text-purple-700 hover:underline">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => openViewers(p.id, p.name)}
                        title="See who viewed this product"
                        className="inline-flex items-center gap-1 text-purple-700 font-semibold hover:text-purple-900 hover:bg-purple-100 px-2 py-0.5 rounded-full transition-colors"
                      >
                        <Eye className="h-3 w-3" /> {p.viewCount}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Viewer Modal */}
      {viewerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setViewerModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-purple-600" />
                  Viewers — {viewerModal.productName}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Last {days} days</p>
              </div>
              <button onClick={() => setViewerModal(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {viewersLoading ? (
                <div className="flex justify-center py-12"><Spinner /></div>
              ) : viewers.length === 0 ? (
                <div className="py-12 text-center">
                  <Eye className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No views recorded in this period</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Viewer</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {viewers.map((v: any) => (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3">
                          {v.userName ? (
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold flex-shrink-0">
                                {v.userName[0]?.toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800 text-xs">{v.userName}</p>
                                <p className="text-gray-400 text-xs">{v.userEmail}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-400">
                              <User className="h-4 w-4" />
                              <span className="text-xs">Guest</span>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {v.source ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600">
                              <Globe className="h-3 w-3" /> {v.source}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Direct</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-500">
                          {new Date(v.viewedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            {viewers.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex items-center justify-between text-xs text-gray-500">
                <span>{viewers.length} view{viewers.length !== 1 ? 's' : ''} total</span>
                <span>{viewers.filter((v: any) => v.userId).length} logged-in · {viewers.filter((v: any) => !v.userId).length} guest</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Selling Products */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Top Selling Products</h2>
          <span className="text-xs text-gray-400">last {days} days</span>
        </div>
        {topSales.filter((p: any) => p.unitsSold > 0).length === 0 ? (
          <p className="text-sm text-gray-400 p-6 text-center">No sales yet in this period.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topSales.filter((p: any) => p.unitsSold > 0).map((p: any, i: number) => (
                <tr key={p.id} className="hover:bg-green-50 cursor-pointer group">
                  <td className="px-6 py-3 text-gray-400 font-medium">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link to={`/products/${p.id}/edit`} className="flex items-center gap-3 group/link">
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt="" className="h-9 w-9 rounded object-cover shrink-0" />
                        : <div className="h-9 w-9 rounded bg-gray-100 shrink-0" />
                      }
                      <span className="font-medium text-gray-800 group-hover/link:text-green-700 group-hover/link:underline truncate max-w-[220px]">{p.name}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">{p.unitsSold}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-700">₹{Number(p.revenue).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function AnalyticsStat({ icon, label, value, sub, bg, sparkData, sparkColor }: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub: string
  bg: string
  sparkData?: number[]
  sparkColor?: string
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <div className={`h-8 w-8 rounded-lg ${bg} flex items-center justify-center`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <div className="flex items-end justify-between mt-2">
        <p className="text-xs text-gray-400">{sub}</p>
        {sparkData && sparkColor && <Sparkline data={sparkData} color={sparkColor} />}
      </div>
    </div>
  )
}
