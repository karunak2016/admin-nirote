import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import type { Customer } from '../types'
import { customersApi } from '../api/customers'
import { Spinner } from '../components/ui/Spinner'

export function CustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    customersApi.getById(Number(id)).then(setCustomer).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>

  if (!customer) {
    return (
      <div className="py-32 text-center">
        <p className="text-gray-500">Customer not found.</p>
        <Link to="/customers" className="mt-3 inline-block text-primary-800 hover:underline">Back to customers</Link>
      </div>
    )
  }

  return (
    <div className="max-w-xl space-y-6">
      <Link to="/customers" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-800">
        <ChevronLeft className="h-4 w-4" /> All Customers
      </Link>

      {/* Profile card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-800">
            {customer.name[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{customer.name}</h1>
            <p className="text-sm text-gray-500">{customer.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {customer.phone && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Phone</p>
              <p className="font-medium text-gray-900 mt-0.5">{customer.phone}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Member Since</p>
            <p className="font-medium text-gray-900 mt-0.5">
              {new Date(customer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Total Orders</p>
            <p className="font-medium text-gray-900 mt-0.5">{customer.totalOrders}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Total Spent</p>
            <p className="font-bold text-primary-800 mt-0.5 text-lg">₹{(customer.totalSpent ?? 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
