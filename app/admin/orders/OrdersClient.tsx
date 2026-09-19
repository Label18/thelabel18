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
        <div className="font-outfit text-[#141414]">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-[#9c7d23]/20 bg-white/60 backdrop-blur-md px-6 py-6 md:px-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-black">Orders</h1>
                    <p className="mt-1 text-sm font-medium text-stone-600">
                        {orders.length} order{orders.length === 1 ? '' : 's'} · expand a row to see items, variations and payment
                    </p>
                </div>
            </div>

            {/* Stat cards */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
                <div className="flex items-center gap-4 rounded-3xl border border-[#9c7d23]/10 bg-white/60 backdrop-blur-md p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-[#9c7d23]/30">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FAF7F1] text-[#9c7d23]">
                        <Layers size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8b8478]">Total Orders</p>
                        <p className="mt-1 text-2xl font-bold tracking-tight text-[#141414]">{orders.length}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-3xl border border-[#9c7d23]/10 bg-white/60 backdrop-blur-md p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-[#9c7d23]/30">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <IndianRupee size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8b8478]">Revenue</p>
                        <p className="mt-1 text-2xl font-bold tracking-tight text-[#141414]">₹{totalRevenue.toLocaleString()}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-3xl border border-[#9c7d23]/10 bg-white/60 backdrop-blur-md p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-[#9c7d23]/30">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                        <Clock size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8b8478]">Pending</p>
                        <p className="mt-1 text-2xl font-bold tracking-tight text-[#141414]">{pendingCount}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-3xl border border-[#9c7d23]/10 bg-white/60 backdrop-blur-md p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-[#9c7d23]/30">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                        <CheckCircle2 size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8b8478]">Delivered</p>
                        <p className="mt-1 text-2xl font-bold tracking-tight text-[#141414]">{deliveredCount}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-3xl border border-[#9c7d23]/10 bg-white/60 backdrop-blur-md p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-[#9c7d23]/30">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                        <XCircle size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8b8478]">Cancelled</p>
                        <p className="mt-1 text-2xl font-bold tracking-tight text-[#141414]">{cancelledCount}</p>
                    </div>
                </div>
            </div>

            {/* Search + filters */}
            <div className="mb-6 flex flex-wrap items-center gap-4 rounded-3xl border border-[#9c7d23]/20 bg-white/60 backdrop-blur-md p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="relative min-w-[220px] flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b8478]" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by order ID, customer, phone, product or SKU…"
                        className="w-full rounded-2xl border border-[#9c7d23]/20 bg-white/80 py-3 pl-11 pr-4 text-sm text-[#141414] outline-none transition-colors focus:border-[#9c7d23]/50 focus:bg-white"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className="rounded-2xl border border-[#9c7d23]/20 bg-white/80 px-4 py-3 text-sm text-[#141414] outline-none transition-colors focus:border-[#9c7d23]/50 focus:bg-white cursor-pointer"
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
                        className="rounded-2xl border border-[#9c7d23]/20 px-4 py-3 text-sm font-semibold text-[#8b8478] hover:bg-[#FAF7F1] hover:text-[#141414] transition-colors"
                    >
                        Clear
                    </button>
                )}
            </div>

            <div className="hidden md:block overflow-hidden rounded-3xl border border-[#9c7d23]/20 bg-white/60 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="overflow-x-auto">
                    <table className="min-w-[1000px] w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#FAF7F1] text-[10px] uppercase tracking-[0.2em] text-[#8b8478]">
                        <tr>
                            <th className="w-12 px-6 py-4 font-semibold"></th>
                            <th className="px-6 py-4 font-semibold">Order</th>
                            <th className="px-6 py-4 font-semibold">Customer</th>
                            <th className="px-6 py-4 font-semibold">Date</th>
                            <th className="px-6 py-4 font-semibold">Items</th>
                            <th className="px-6 py-4 font-semibold">Amount Paid</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
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
                                    <tr className="border-t border-[#9c7d23]/10 hover:bg-white/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setExpanded(isOpen ? null : o.id)}
                                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#9c7d23]/20 text-[#8b8478] transition-all hover:border-[#9c7d23]/50 hover:text-[#141414] hover:shadow-sm"
                                            >
                                                <ChevronDown
                                                    size={14}
                                                    strokeWidth={2.5}
                                                    className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                                />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-[#141414]">#{o.id.slice(0, 8).toUpperCase()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-[#141414]">{o.ship_full_name}</p>
                                            <p className="text-xs text-[#8b8478]">{o.ship_phone}</p>
                                        </td>
                                        <td className="px-6 py-4 text-[#8b8478]">{orderDate}</td>
                                        <td className="px-6 py-4 text-[#8b8478]">{itemCount} items</td>
                                        <td className="px-6 py-4 font-bold text-[#141414]">
                                            ₹{Number(o.total).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wider font-bold ${
                                                        STATUS_STYLES[o.status] ?? 'bg-stone-100 text-stone-500'
                                                    }`}
                                                >
                                                    {STATUS_LABEL[o.status] ?? o.status}
                                                </span>
                                                {updatingId === o.id && (
                                                    <Loader2 size={14} className="animate-spin text-[#9c7d23]" />
                                                )}
                                                <a
                                                    href={`/admin/orders/invoice/${o.id}`}
                                                    download
                                                    onClick={(e) => e.stopPropagation()}
                                                    title="Download invoice"
                                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#9c7d23]/20 text-[#8b8478] transition-all hover:border-[#9c7d23]/50 hover:text-[#141414] hover:shadow-sm"
                                                >
                                                    <Download size={14} strokeWidth={2} />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>

                                    {isOpen && (
                                        <tr>
                                            <td colSpan={7} className="bg-stone-50/60 px-0 py-0">
                                                <div className="grid grid-cols-2 gap-6 px-6 py-5 lg:grid-cols-[1.6fr_1fr]">
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

            {/* Mobile Card Layout */}
            <div className="flex flex-col gap-4 md:hidden">
                {filteredOrders.map((o) => {
                    const isOpen = expanded === o.id;
                    const itemCount = o.items.reduce((sum, i) => sum + i.quantity, 0);
                    const orderDate = new Date(o.created_at).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                    });

                    return (
                        <div key={o.id} className="rounded-2xl border border-[#9c7d23]/20 bg-white/60 backdrop-blur-md shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col overflow-hidden">
                            <div className="p-4 flex items-center justify-between border-b border-[#9c7d23]/10">
                                <div>
                                    <span className="font-semibold text-[#141414] text-sm">#{o.id.slice(0, 8).toUpperCase()}</span>
                                    <p className="text-[11px] text-[#8b8478] mt-0.5">{orderDate}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold ${
                                            STATUS_STYLES[o.status] ?? 'bg-stone-100 text-stone-500'
                                        }`}
                                    >
                                        {STATUS_LABEL[o.status] ?? o.status}
                                    </span>
                                    {updatingId === o.id && (
                                        <Loader2 size={12} className="animate-spin text-[#9c7d23]" />
                                    )}
                                </div>
                            </div>

                            <div className="p-4 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-[#141414] text-sm">{o.ship_full_name}</p>
                                        <p className="text-xs text-[#8b8478]">{o.ship_phone}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-[#141414] text-sm">₹{Number(o.total).toLocaleString()}</p>
                                        <p className="text-xs text-[#8b8478]">{itemCount} items</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                    <button
                                        onClick={() => setExpanded(isOpen ? null : o.id)}
                                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white border border-[#9c7d23]/20 py-2 text-xs font-semibold text-[#8b8478] hover:border-[#9c7d23]/50 hover:text-[#141414]"
                                    >
                                        {isOpen ? 'Hide Details' : 'View Details'}
                                        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <a
                                        href={`/admin/orders/invoice/${o.id}`}
                                        download
                                        className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-xl bg-white border border-[#9c7d23]/20 text-[#8b8478] hover:border-[#9c7d23]/50 hover:text-[#141414]"
                                    >
                                        <Download size={14} />
                                    </a>
                                </div>
                            </div>

                            {isOpen && (
                                <div className="bg-[#FAF7F1] p-4 border-t border-[#9c7d23]/10 flex flex-col gap-5">
                                    {/* Items */}
                                    <div>
                                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#8b8478]">
                                            Items
                                        </p>
                                        <div className="divide-y divide-[#9c7d23]/10 rounded-xl border border-[#9c7d23]/10 bg-white">
                                            {o.items.map((item) => (
                                                <div key={item.id} className="flex gap-3 p-3">
                                                    {item.product_variations?.image_url ? (
                                                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#9c7d23]/10">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img
                                                                src={item.product_variations.image_url}
                                                                alt={item.product_name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#9c7d23]/10 bg-stone-50 text-stone-300">
                                                            <ImageOff size={14} />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-semibold text-[#141414] leading-tight">
                                                            {item.product_name}
                                                        </p>
                                                        <p className="text-[10px] text-[#8b8478] mt-0.5">
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
                                                        <div className="mt-1.5 flex items-center justify-between">
                                                            <p className="text-[10px] text-[#8b8478]">
                                                                ₹{Number(item.unit_price).toLocaleString()} each
                                                            </p>
                                                            <p className="text-xs font-bold text-[#141414]">
                                                                ₹{Number(item.line_total).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Shipping */}
                                    <div>
                                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#8b8478]">
                                            Shipping Address
                                        </p>
                                        <div className="flex items-start gap-2 rounded-xl border border-[#9c7d23]/10 bg-white p-3">
                                            <MapPin size={14} className="mt-0.5 shrink-0 text-[#8b8478]" />
                                            <div className="text-xs text-stone-600">
                                                <p className="font-semibold text-[#141414]">{o.ship_full_name}</p>
                                                <p className="mt-0.5 leading-relaxed text-[#8b8478]">
                                                    {o.ship_line1}
                                                    {o.ship_line2 ? `, ${o.ship_line2}` : ''}, {o.ship_city},{' '}
                                                    {o.ship_state} {o.ship_postal_code}, {o.ship_country}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div>
                                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#8b8478]">
                                            Update Status
                                        </p>
                                        <select
                                            value={o.status}
                                            disabled={updatingId === o.id}
                                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                            className="w-full rounded-xl border border-[#9c7d23]/20 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#141414] outline-none focus:border-[#9c7d23]/50 disabled:opacity-40 mb-4"
                                        >
                                            {Object.entries(STATUS_LABEL).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>

                                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#8b8478]">
                                            Summary
                                        </p>
                                        <div className="space-y-1.5 rounded-xl border border-[#9c7d23]/10 bg-white p-3 text-xs">
                                            <div className="flex justify-between text-stone-500">
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
                                            <div className="flex justify-between border-t border-[#9c7d23]/10 pt-2 text-sm font-bold text-[#141414]">
                                                <span>Total</span>
                                                <span>₹{Number(o.total).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredOrders.length === 0 && (
                    <div className="rounded-2xl border border-[#9c7d23]/20 bg-white/60 p-8 text-center text-sm text-[#8b8478]">
                        {orders.length === 0 ? 'No orders yet.' : 'No orders match your search or filter.'}
                    </div>
                )}
            </div>
        </div>
    )
}