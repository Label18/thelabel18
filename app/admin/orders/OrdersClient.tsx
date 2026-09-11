// app/admin/orders/OrdersClient.tsx
'use client'
import { Fragment, useMemo, useState } from 'react'
import {
    ChevronDown,
    ImageOff,
    Search,
    Layers,
    CheckCircle2,
    Truck,
    Clock,
    XCircle,
    IndianRupee,
    MapPin,
    Loader2,
    Download,
} from 'lucide-react'
import { updateOrderStatus } from './actions'

type OrderItem = {
    id: string
    product_id: string
    variation_id: string | null
    product_name: string
    variation_label: string | null
    unit_price: number
    quantity: number
    line_total: number
    product_variations: {
        image_url: string | null
        size: string | null
        color: string | null
        sku: string | null
    } | null
}

export type StoreOrder = {
    id: string
    status: string
    subtotal: number
    discount_amount: number
    total: number
    coupon_code: string | null
    created_at: string
    ship_full_name: string
    ship_phone: string
    ship_line1: string
    ship_line2: string | null
    ship_city: string
    ship_state: string
    ship_postal_code: string
    ship_country: string
    items: OrderItem[]
}

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

const STATUS_LABEL: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
}

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    confirmed: 'bg-blue-50 text-blue-700',
    shipped: 'bg-indigo-50 text-indigo-700',
    delivered: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-rose-50 text-rose-600',
}

export default function OrdersClient({ orders: initialOrders }: { orders: StoreOrder[] }) {
    const [orders, setOrders] = useState(initialOrders)
    const [expanded, setExpanded] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    const totalRevenue = useMemo(
        () => orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? Number(o.total) : 0), 0),
        [orders]
    )
    const pendingCount = orders.filter((o) => o.status === 'pending').length
    const deliveredCount = orders.filter((o) => o.status === 'delivered').length
    const cancelledCount = orders.filter((o) => o.status === 'cancelled').length

    const filteredOrders = useMemo(() => {
        const q = search.trim().toLowerCase()
        return orders.filter((o) => {
            const matchesSearch =
                !q ||
                o.id.toLowerCase().includes(q) ||
                o.ship_full_name?.toLowerCase().includes(q) ||
                o.ship_phone?.toLowerCase().includes(q) ||
                o.coupon_code?.toLowerCase().includes(q) ||
                o.items.some(
                    (item) =>
                        item.product_name.toLowerCase().includes(q) ||
                        item.product_variations?.sku?.toLowerCase().includes(q)
                )
            const matchesStatus = statusFilter === 'all' || o.status === statusFilter
            return matchesSearch && matchesStatus
        })
    }, [orders, search, statusFilter])

    async function handleStatusChange(orderId: string, newStatus: string) {
        setUpdatingId(orderId)
        const prev = orders
        setOrders((os) => os.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))

        try {
            await updateOrderStatus(orderId, newStatus)
        } catch (err) {
            setOrders(prev)
            console.error('Failed to update order status:', err)
        } finally {
            setUpdatingId(null)
        }
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-6 py-5 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-black">Orders</h1>
                    <p className="mt-1 text-sm font-medium text-stone-600">
                        {orders.length} order{orders.length === 1 ? '' : 's'} · expand a row to see items, variations and payment
                    </p>
                </div>
            </div>

            {/* Stat cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
                        <Layers size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Total Orders</p>
                        <p className="mt-0.5 text-2xl font-bold text-black">{orders.length}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <IndianRupee size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Revenue</p>
                        <p className="mt-0.5 text-2xl font-bold text-black">₹{totalRevenue.toLocaleString()}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <Clock size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Pending</p>
                        <p className="mt-0.5 text-2xl font-bold text-black">{pendingCount}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <CheckCircle2 size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Delivered</p>
                        <p className="mt-0.5 text-2xl font-bold text-black">{deliveredCount}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                        <XCircle size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Cancelled</p>
                        <p className="mt-0.5 text-2xl font-bold text-black">{cancelledCount}</p>
                    </div>
                </div>
            </div>

            {/* Search + filters */}
            <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                <div className="relative min-w-[220px] flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by order ID, customer, phone, product or SKU…"
                        className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-black outline-none focus:border-black"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className="rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-black outline-none focus:border-black"
                >
                    <option value="all">All Statuses</option>
                    {Object.entries(STATUS_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>

                {(search || statusFilter !== 'all') && (
                    <button
                        onClick={() => {
                            setSearch('')
                            setStatusFilter('all')
                        }}
                        className="rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-50"
                    >
                        Clear
                    </button>
                )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-stone-200 bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500">
                            <th className="w-8 px-6 py-3 font-semibold"></th>
                            <th className="px-6 py-3 font-semibold">Order</th>
                            <th className="px-6 py-3 font-semibold">Customer</th>
                            <th className="px-6 py-3 font-semibold">Date</th>
                            <th className="px-6 py-3 font-semibold">Items</th>
                            <th className="px-6 py-3 font-semibold">Amount Paid</th>
                            <th className="px-6 py-3 font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((o) => {
                            const isOpen = expanded === o.id
                            const itemCount = o.items.reduce((sum, i) => sum + i.quantity, 0)
                            const orderDate = new Date(o.created_at).toLocaleString('en-IN', {
                                timeZone: 'Asia/Kolkata',
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                            })

                            return (
                                <Fragment key={o.id}>
                                    <tr className="border-t border-stone-100 hover:bg-stone-50">
                                        <td className="px-6 py-3.5">
                                            <button
                                                onClick={() => setExpanded(isOpen ? null : o.id)}
                                                className="text-stone-400 hover:text-black"
                                            >
                                                <ChevronDown
                                                    size={16}
                                                    className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                                />
                                            </button>
                                        </td>
                                        <td className="px-6 py-3.5 font-outfit text-xs text-stone-600">
                                            #{o.id.slice(0, 8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <p className="font-medium text-black">{o.ship_full_name}</p>
                                            <p className="text-xs text-stone-500">{o.ship_phone}</p>
                                        </td>
                                        <td className="px-6 py-3.5 text-stone-600">{orderDate}</td>
                                        <td className="px-6 py-3.5 text-stone-600">{itemCount}</td>
                                        <td className="px-6 py-3.5 font-semibold text-black">
                                            ₹{Number(o.total).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${
                                                        STATUS_STYLES[o.status] ?? 'bg-stone-100 text-stone-500'
                                                    }`}
                                                >
                                                    {STATUS_LABEL[o.status] ?? o.status}
                                                </span>
                                                {updatingId === o.id && (
                                                    <Loader2 size={12} className="animate-spin text-stone-400" />
                                                )}
                                                <a
                                                    href={`/admin/orders/invoice/${o.id}`}
                                                    download
                                                    onClick={(e) => e.stopPropagation()}
                                                    title="Download invoice"
                                                    className="ml-1 text-stone-400 hover:text-black"
                                                >
                                                    <Download size={14} />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>

                                    {isOpen && (
                                        <tr>
                                            <td colSpan={7} className="bg-stone-50/60 px-0 py-0">
                                                <div className="grid grid-cols-1 gap-6 px-6 py-5 lg:grid-cols-[1.6fr_1fr]">
                                                    {/* Items + variations */}
                                                    <div>
                                                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                                                            Items & Variations
                                                        </p>
                                                        <div className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white">
                                                            {o.items.map((item) => (
                                                                <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                                                                    {item.product_variations?.image_url ? (
                                                                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-stone-200">
                                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                            <img
                                                                                src={item.product_variations.image_url}
                                                                                alt={item.product_name}
                                                                                className="h-full w-full object-cover"
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-300">
                                                                            <ImageOff size={14} />
                                                                        </div>
                                                                    )}
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="truncate text-sm font-medium text-black">
                                                                            {item.product_name}
                                                                        </p>
                                                                        <p className="text-xs text-stone-500">
                                                                            {item.variation_label ||
                                                                                [
                                                                                    item.product_variations?.size,
                                                                                    item.product_variations?.color,
                                                                                ]
                                                                                    .filter(Boolean)
                                                                                    .join(' · ') ||
                                                                                item.product_variations?.sku ||
                                                                                '—'}
                                                                            {' · '}Qty {item.quantity}
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-xs text-stone-400">
                                                                            ₹{Number(item.unit_price).toLocaleString()} each
                                                                        </p>
                                                                        <p className="text-sm font-semibold text-black">
                                                                            ₹{Number(item.line_total).toLocaleString()}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Shipping address */}
                                                        <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                                                            Shipping Address
                                                        </p>
                                                        <div className="flex items-start gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3">
                                                            <MapPin size={14} className="mt-0.5 shrink-0 text-stone-400" />
                                                            <div className="text-sm text-stone-600">
                                                                <p className="font-medium text-black">{o.ship_full_name}</p>
                                                                <p>
                                                                    {o.ship_line1}
                                                                    {o.ship_line2 ? `, ${o.ship_line2}` : ''}, {o.ship_city},{' '}
                                                                    {o.ship_state} {o.ship_postal_code}, {o.ship_country}
                                                                </p>
                                                                <p className="text-stone-400">{o.ship_phone}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Payment summary + status control */}
                                                    <div>
                                                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                                                            Payment Summary
                                                        </p>
                                                        <div className="space-y-2 rounded-xl border border-stone-200 bg-white px-4 py-4 text-sm">
                                                            <div className="flex justify-between text-stone-600">
                                                                <span>Subtotal</span>
                                                                <span>₹{Number(o.subtotal).toLocaleString()}</span>
                                                            </div>
                                                            {Number(o.discount_amount) > 0 && (
                                                                <div className="flex justify-between text-emerald-600">
                                                                    <span>
                                                                        Discount {o.coupon_code ? `(${o.coupon_code})` : ''}
                                                                    </span>
                                                                    <span>−₹{Number(o.discount_amount).toLocaleString()}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between border-t border-stone-100 pt-2 text-base font-bold text-black">
                                                                <span>Amount Paid</span>
                                                                <span>₹{Number(o.total).toLocaleString()}</span>
                                                            </div>
                                                        </div>

                                                        <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                                                            Update Status
                                                        </p>
                                                        <select
                                                            value={o.status}
                                                            disabled={updatingId === o.id}
                                                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                                            className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm font-medium text-black outline-none focus:border-black disabled:opacity-40"
                                                        >
                                                            {Object.entries(STATUS_LABEL).map(([value, label]) => (
                                                                <option key={value} value={value}>
                                                                    {label}
                                                                </option>
                                                            ))}
                                                        </select>

                                                        <a
                                                            href={`/admin/orders/invoice/${o.id}`}
                                                            download
                                                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-stone-700 hover:border-black hover:text-black"
                                                        >
                                                            <Download size={14} />
                                                            Download Invoice
                                                        </a>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            )
                        })}

                        {filteredOrders.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-sm text-stone-500">
                                    {orders.length === 0 ? 'No orders yet.' : 'No orders match your search or filter.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}