import * as XLSX from 'xlsx'

function makeSheet(headers: string[], rows: (string | number)[][]) {
  return XLSX.utils.aoa_to_sheet([headers, ...rows])
}

function setColWidths(ws: XLSX.WorkSheet, widths: number[]) {
  ws['!cols'] = widths.map(w => ({ wch: w }))
}

export function downloadAnalyticsExcel(params: {
  days: number
  summary: any
  filledViews: { date: string; value: number }[]
  filledOrders: { date: string; value: number }[]
  filledRevenue: { date: string; value: number }[]
  topViews: any[]
  topSales: any[]
  traffic: any[]
}) {
  const { days, summary, filledViews, filledOrders, filledRevenue, topViews, topSales, traffic } = params
  const wb = XLSX.utils.book_new()
  const period = `Last ${days} days`

  // ── Sheet 1: Summary ──────────────────────────────────────────────────────
  const summaryWs = makeSheet(
    ['Metric', 'Value', 'Period'],
    [
      ['Product Views',    summary?.totalViews       ?? 0, period],
      ['All-time Views',   summary?.allTimeViews     ?? 0, 'All time'],
      ['Orders',           summary?.totalOrders      ?? 0, period],
      ['Revenue (₹)',      Number(summary?.totalRevenue ?? 0), period],
      ['Unique Customers', summary?.uniqueCustomers  ?? 0, period],
    ]
  )
  setColWidths(summaryWs, [22, 16, 16])
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary')

  // ── Sheet 2: Daily Views ──────────────────────────────────────────────────
  const viewsWs = makeSheet(
    ['Date', 'Product Views'],
    filledViews.map(d => [d.date, d.value])
  )
  setColWidths(viewsWs, [14, 16])
  XLSX.utils.book_append_sheet(wb, viewsWs, 'Daily Views')

  // ── Sheet 3: Daily Orders ─────────────────────────────────────────────────
  const ordersWs = makeSheet(
    ['Date', 'Orders'],
    filledOrders.map(d => [d.date, d.value])
  )
  setColWidths(ordersWs, [14, 12])
  XLSX.utils.book_append_sheet(wb, ordersWs, 'Daily Orders')

  // ── Sheet 4: Daily Revenue ────────────────────────────────────────────────
  const revenueWs = makeSheet(
    ['Date', 'Revenue (₹)'],
    filledRevenue.map(d => [d.date, d.value])
  )
  setColWidths(revenueWs, [14, 16])
  XLSX.utils.book_append_sheet(wb, revenueWs, 'Daily Revenue')

  // ── Sheet 5: Top Products by Views ────────────────────────────────────────
  const topViewsWs = makeSheet(
    ['#', 'Product Name', 'Views'],
    topViews.map((p: any, i: number) => [i + 1, p.name ?? '', p.viewCount ?? 0])
  )
  setColWidths(topViewsWs, [4, 36, 10])
  XLSX.utils.book_append_sheet(wb, topViewsWs, 'Top by Views')

  // ── Sheet 6: Top Products by Sales ───────────────────────────────────────
  const topSalesWs = makeSheet(
    ['#', 'Product Name', 'Units Sold', 'Revenue (₹)'],
    topSales
      .filter((p: any) => p.unitsSold > 0)
      .map((p: any, i: number) => [i + 1, p.name ?? '', p.unitsSold ?? 0, Number(p.revenue ?? 0)])
  )
  setColWidths(topSalesWs, [4, 36, 14, 16])
  XLSX.utils.book_append_sheet(wb, topSalesWs, 'Top by Sales')

  // ── Sheet 7: Traffic Sources ──────────────────────────────────────────────
  const totalTraffic = traffic.reduce((s: number, r: any) => s + r.views, 0) || 1
  const trafficWs = makeSheet(
    ['Source', 'Views', 'Share (%)'],
    traffic.map((t: any) => [
      t.source ?? 'Direct',
      t.views ?? 0,
      Math.round(((t.views ?? 0) / totalTraffic) * 100),
    ])
  )
  setColWidths(trafficWs, [18, 10, 12])
  XLSX.utils.book_append_sheet(wb, trafficWs, 'Traffic Sources')

  // ── Download ──────────────────────────────────────────────────────────────
  const date = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `nirote-analytics-${period.replace(/ /g, '-')}-${date}.xlsx`)
}
