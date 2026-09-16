import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2, ImageOff, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Product } from '../types'
import { productsApi } from '../api/products'
import { categoriesApi } from '../api/categories'
import { optionsApi } from '../api/options'
import type { Category } from '../types'
import type { ProductOption } from '../api/options'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { Badge } from '../components/ui/Badge'
import { SortTh } from '../components/ui/SortTh'
import { useSortable } from '../hooks/useSortable'

const PAGE_SIZE = 10

export function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [fabric, setFabric] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [fabrics, setFabrics] = useState<ProductOption[]>([])
  const [deactivating, setDeactivating] = useState<number | null>(null)
  const { sortCol, sortDir, handleSort, sort } = useSortable('', 'desc')

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {})
    optionsApi.getFabrics().then(setFabrics).catch(() => {})
  }, [])

  const load = useCallback(async (p: number, q: string, catId: number | '', fab: string) => {
    setLoading(true)
    try {
      const data = q
        ? await productsApi.search(q, p, PAGE_SIZE)
        : await productsApi.list(p, PAGE_SIZE, catId || undefined, fab || undefined)
      setProducts(data.items ?? [])
      setTotalCount(data.totalCount ?? 0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page, search, categoryId, fabric) }, [page, search, categoryId, fabric, load])

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput.trim())
    setPage(1)
  }

  function handleSearchClear() {
    setSearchInput('')
    setSearch('')
    setPage(1)
  }

  function handleCategoryChange(val: string) {
    setCategoryId(val === '' ? '' : Number(val))
    setPage(1)
  }

  function handleFabricChange(val: string) {
    setFabric(val)
    setPage(1)
  }

  function clearFilters() {
    setCategoryId('')
    setFabric('')
    setSearch('')
    setSearchInput('')
    setPage(1)
  }

  const hasFilters = categoryId !== '' || fabric !== '' || search !== ''

  async function handleDeactivate(id: number) {
    if (!confirm('Deactivate this product? It will be hidden from the store.')) return
    setDeactivating(id)
    try {
      await productsApi.deactivate(id)
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isActive: false } : p))
    } finally {
      setDeactivating(null)
    }
  }

  const sorted = sort(products, (p, col) => {
    if (col === 'name')     return p.name
    if (col === 'category') return p.categoryName ?? ''
    if (col === 'material') return p.fabric ?? ''
    if (col === 'price')    return p.price
    if (col === 'stock')    return p.stockQuantity
    if (col === 'status')   return p.isActive ? 'Active' : 'Inactive'
    return ''
  })

  const th = { sortCol, sortDir, onSort: handleSort }

  return (
    <div className="space-y-4">
      {/* Toolbar — single line */}
      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={handleSearchSubmit} className="flex gap-1 flex-1 min-w-[180px] max-w-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-md border border-gray-200 py-1.5 pl-9 pr-3 text-sm focus:border-primary-800 focus:outline-none"
            />
          </div>
          <button type="submit" className="px-3 py-1.5 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">Go</button>
          {search && (
            <button type="button" onClick={handleSearchClear} className="px-2 text-sm text-gray-400 hover:text-gray-700">✕</button>
          )}
        </form>

        <select
          value={categoryId}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="rounded-md border border-gray-200 py-1.5 px-3 text-sm focus:border-primary-800 focus:outline-none bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={fabric}
          onChange={(e) => handleFabricChange(e.target.value)}
          className="rounded-md border border-gray-200 py-1.5 px-3 text-sm focus:border-primary-800 focus:outline-none bg-white"
        >
          <option value="">All Materials</option>
          {fabrics.map((f) => (
            <option key={f.id} value={f.value}>{f.value}</option>
          ))}
        </select>

        {hasFilters && (
          <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2 whitespace-nowrap">
            Clear
          </button>
        )}

        <div className="flex items-center gap-3 ml-auto">
          <span className="text-sm text-gray-500 whitespace-nowrap">{totalCount} product{totalCount !== 1 ? 's' : ''}</span>
          <Link to="/products/new">
            <Button size="sm"><Plus className="h-4 w-4" /> Add Product</Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : sorted.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-400">
            {hasFilters ? 'No products match the selected filters.' : 'No products yet.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <SortTh label="Product"  col="name"     {...th} />
                  <SortTh label="Category" col="category" {...th} />
                  <SortTh label="Material" col="material" {...th} />
                  <SortTh label="Price"    col="price"    {...th} align="right" />
                  <SortTh label="Stock"    col="stock"    {...th} align="right" />
                  <SortTh label="Status"   col="status"   {...th} align="center" />
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.defaultImageUrl ? (
                          <img src={p.defaultImageUrl} alt={p.name} className="h-10 w-8 rounded object-cover object-top flex-shrink-0" />
                        ) : (
                          <div className="h-10 w-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <ImageOff className="h-4 w-4 text-gray-300" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900 max-w-[200px] truncate">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.categoryName}</td>
                    <td className="px-4 py-3 text-gray-600">{p.fabric}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{p.stockQuantity}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={p.isActive ? 'success' : 'danger'}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/products/${p.id}/edit`}>
                          <button className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary-800">
                            <Pencil className="h-4 w-4" />
                          </button>
                        </Link>
                        {p.isActive && (
                          <button
                            onClick={() => handleDeactivate(p.id)}
                            disabled={deactivating === p.id}
                            className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages} · {Math.min(PAGE_SIZE, sorted.length)} of {totalCount}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(1)}
                className="px-2 py-1.5 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-white transition-colors"
              >«</button>
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-white transition-colors"
              ><ChevronLeft className="h-4 w-4" /></button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) pageNum = i + 1
                else if (page <= 3) pageNum = i + 1
                else if (page >= totalPages - 2) pageNum = totalPages - 4 + i
                else pageNum = page - 2 + i
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`min-w-[32px] px-2 py-1.5 text-xs rounded border transition-colors ${
                      pageNum === page
                        ? 'bg-primary-800 text-white border-primary-800'
                        : 'border-gray-200 hover:bg-white'
                    }`}
                  >{pageNum}</button>
                )
              })}

              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-white transition-colors"
              ><ChevronRight className="h-4 w-4" /></button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(totalPages)}
                className="px-2 py-1.5 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-white transition-colors"
              >»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
