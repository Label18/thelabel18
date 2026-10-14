'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type PlaceOrderItemInput = {
  productId: string
  variationId: string | null
  quantity: number
  productName: string
  color: string | null
  size: string | null
  price: number
}

export type PlaceOrderInput = {
  userId: string
  addressId?: string | null
  appliedCoupon?: string | null
  items: PlaceOrderItemInput[]
  shippingAddress: {
    fullName: string
    phone: string
    line1: string
    line2?: string | null
    city: string
    state: string
    postalCode: string
    country: string
  }
}

export async function placeOrderAction(input: PlaceOrderInput) {
  const { userId, addressId, appliedCoupon, items, shippingAddress } = input

  if (!userId) {
    throw new Error('User authentication required to place an order.')
  }

  if (!items || items.length === 0) {
    throw new Error('Your cart is empty.')
  }

  if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.line1) {
    throw new Error('Please provide complete shipping address details.')
  }

  // 1. Verify stock for each variation
  for (const item of items) {
    if (!item.variationId) continue

    const { data: variation, error: vErr } = await supabaseAdmin
      .from('product_variations')
      .select('stock_quantity')
      .eq('id', item.variationId)
      .single()

    if (vErr || !variation) {
      throw new Error(`Product option not found for "${item.productName}".`)
    }

    if (variation.stock_quantity < item.quantity) {
      throw new Error(
        `"${item.productName}" only has ${variation.stock_quantity} item(s) left in stock. Please adjust quantity.`
      )
    }
  }

  // 2. Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0)

  // 3. Validate coupon if provided
  let discountAmount = 0
  let validCouponRow: any = null

  if (appliedCoupon && appliedCoupon.trim()) {
    const code = appliedCoupon.trim().toUpperCase()
    const { data: coupon, error: cErr } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single()

    if (!cErr && coupon) {
      const now = new Date()
      const isStarted = !coupon.valid_from || new Date(coupon.valid_from) <= now
      const isNotExpired = !coupon.valid_until || new Date(coupon.valid_until) >= now
      const meetsMinOrder = !coupon.min_order_value || subtotal >= Number(coupon.min_order_value)
      const hasUsageLeft = coupon.usage_limit == null || (coupon.used_count ?? 0) < coupon.usage_limit

      if (isStarted && isNotExpired && meetsMinOrder && hasUsageLeft) {
        validCouponRow = coupon
        if (coupon.discount_type === 'percentage') {
          let d = (subtotal * Number(coupon.discount_value)) / 100
          if (coupon.max_discount_amount) {
            d = Math.min(d, Number(coupon.max_discount_amount))
          }
          discountAmount = Math.round(d)
        } else {
          discountAmount = Math.min(Number(coupon.discount_value), subtotal)
        }
      }
    }
  }

  const total = Math.max(0, subtotal - discountAmount)

  // 4. Insert into orders table using admin client (bypasses RLS)
  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: userId,
      address_id: addressId || null,
      total,
      subtotal,
      discount_amount: discountAmount,
      coupon_code: validCouponRow ? validCouponRow.code : null,
      ship_full_name: shippingAddress.fullName.trim(),
      ship_phone: shippingAddress.phone.trim(),
      ship_line1: shippingAddress.line1.trim(),
      ship_line2: shippingAddress.line2?.trim() || null,
      ship_city: shippingAddress.city.trim(),
      ship_state: shippingAddress.state.trim(),
      ship_postal_code: shippingAddress.postalCode.trim(),
      ship_country: shippingAddress.country.trim(),
      status: 'pending',
    })
    .select('id')
    .single()

  if (orderErr || !order) {
    console.error('Failed to insert order:', orderErr)
    throw new Error(orderErr?.message || 'Failed to create order record.')
  }

  try {
    // 5. Insert order items with correct database schema
    const orderItems = items.map((item) => {
      const label = [item.color, item.size].filter(Boolean).join(' / ') || null
      const unitPrice = Number(item.price || 0)
      return {
        order_id: order.id,
        product_id: item.productId,
        variation_id: item.variationId,
        product_name: item.productName,
        variation_label: label,
        unit_price: unitPrice,
        quantity: item.quantity,
        line_total: unitPrice * item.quantity,
      }
    })

    const { error: itemsErr } = await supabaseAdmin.from('order_items').insert(orderItems)
    if (itemsErr) {
      console.error('Failed to insert order items:', itemsErr)
      throw new Error(`Failed to save order items: ${itemsErr.message}`)
    }

    // 6. Decrease stock for each purchased variation
    for (const item of items) {
      if (!item.variationId) continue
      const { data: current } = await supabaseAdmin
        .from('product_variations')
        .select('stock_quantity')
        .eq('id', item.variationId)
        .single()

      if (current && typeof current.stock_quantity === 'number') {
        const newStock = Math.max(0, current.stock_quantity - item.quantity)
        await supabaseAdmin
          .from('product_variations')
          .update({ stock_quantity: newStock })
          .eq('id', item.variationId)
      }
    }

    // 7. Clear user's cart
    await supabaseAdmin.from('cart_items').delete().eq('user_id', userId)

    // 8. Increment coupon usage if applied
    if (validCouponRow) {
      const nextCount = (validCouponRow.used_count ?? 0) + 1
      await supabaseAdmin
        .from('coupons')
        .update({ used_count: nextCount })
        .eq('id', validCouponRow.id)
    }

    revalidatePath('/orders')
    revalidatePath(`/orders/${order.id}`)
    revalidatePath('/admin/orders')
    revalidatePath('/cart')

    return { success: true, orderId: order.id }
  } catch (err: any) {
    // If saving items or subsequent steps fail, cleanup partial order row
    await supabaseAdmin.from('order_items').delete().eq('order_id', order.id)
    await supabaseAdmin.from('orders').delete().eq('id', order.id)
    throw err
  }
}

export async function decreaseStockForOrder(items: { variation_id: string | null; quantity: number }[]) {
  try {
    for (const item of items) {
      if (!item.variation_id || !item.quantity) continue

      const { data: current } = await supabaseAdmin
        .from('product_variations')
        .select('stock_quantity')
        .eq('id', item.variation_id)
        .single()

      if (current && typeof current.stock_quantity === 'number') {
        const newStock = Math.max(0, current.stock_quantity - item.quantity)
        await supabaseAdmin
          .from('product_variations')
          .update({ stock_quantity: newStock })
          .eq('id', item.variation_id)
      }
    }
    return { success: true }
  } catch (err: any) {
    console.error('Failed to decrement stock on order placement:', err)
    return { success: false, error: err?.message }
  }
}
