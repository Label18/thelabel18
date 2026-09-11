// app/admin/orders/invoice/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const GOLD = rgb(0.831, 0.686, 0.216) // #D4AF37
const INK = rgb(0.05, 0.05, 0.05)
const MUTED = rgb(0.4, 0.4, 0.4)
const LINE = rgb(0.85, 0.85, 0.85)

// Works whether `params` arrives as a plain object (Next.js 14 and earlier)
// or a Promise (Next.js 15+).
type RouteParams = { id: string } | Promise<{ id: string }>

async function resolveParams(params: RouteParams): Promise<{ id: string }> {
  return await params
}

export async function GET(
  _req: NextRequest,
  { params }: { params: RouteParams }
) {
  try {
    const { id } = await resolveParams(params)

    if (!id) {
      return NextResponse.json({ error: 'Missing order id' }, { status: 400 })
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select(
        `
        id, status, subtotal, discount_amount, total, coupon_code, created_at,
        ship_full_name, ship_phone, ship_line1, ship_line2, ship_city, ship_state, ship_postal_code, ship_country,
        items:order_items ( id, product_name, variation_label, unit_price, quantity, line_total )
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      console.error('[invoice route] supabase error:', error.message)
      return NextResponse.json({ error: `Order lookup failed: ${error.message}` }, { status: 500 })
    }
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const pdfBytes = await buildInvoicePdf(order)

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.id.slice(0, 8).toUpperCase()}.pdf"`,
      },
    })
  } catch (err) {
    console.error('[invoice route] unexpected error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error generating invoice'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function buildInvoicePdf(order: {
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
  items: {
    id: string
    product_name: string
    variation_label: string | null
    unit_price: number
    quantity: number
    line_total: number
  }[]
}) {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let page = pdfDoc.addPage([595.28, 841.89]) // A4
  const marginX = 50
  let y = 800

  function text(
    str: string,
    x: number,
    yy: number,
    opts: { size?: number; f?: typeof font; color?: ReturnType<typeof rgb> } = {}
  ) {
    page.drawText(str, {
      x,
      y: yy,
      size: opts.size ?? 10,
      font: opts.f ?? font,
      color: opts.color ?? INK,
    })
  }

  function line(yy: number) {
    page.drawLine({
      start: { x: marginX, y: yy },
      end: { x: 595.28 - marginX, y: yy },
      thickness: 0.75,
      color: LINE,
    })
  }

  // Header
  text('THE LABEL 18', marginX, y, { size: 20, f: bold, color: GOLD })
  text('INVOICE', 595.28 - marginX - 70, y, { size: 20, f: bold })
  y -= 20
  text('Luxury Fashion House', marginX, y, { size: 9, color: MUTED })
  y -= 40
  line(y)
  y -= 25

  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  text(`Invoice No.`, marginX, y, { size: 9, color: MUTED })
  text(`#${order.id.slice(0, 8).toUpperCase()}`, marginX + 90, y, { size: 10, f: bold })
  y -= 16
  text(`Invoice Date`, marginX, y, { size: 9, color: MUTED })
  text(orderDate, marginX + 90, y, { size: 10 })
  y -= 16
  text(`Status`, marginX, y, { size: 9, color: MUTED })
  text(order.status.toUpperCase(), marginX + 90, y, { size: 10, f: bold, color: GOLD })
  y -= 30

  text('BILL TO', marginX, y, { size: 9, f: bold, color: MUTED })
  y -= 16
  text(order.ship_full_name, marginX, y, { size: 11, f: bold })
  y -= 15
  const addrLine1 = `${order.ship_line1}${order.ship_line2 ? ', ' + order.ship_line2 : ''}`
  text(addrLine1, marginX, y, { size: 9.5 })
  y -= 13
  text(
    `${order.ship_city}, ${order.ship_state} ${order.ship_postal_code}, ${order.ship_country}`,
    marginX,
    y,
    { size: 9.5 }
  )
  y -= 13
  text(`Phone: ${order.ship_phone}`, marginX, y, { size: 9.5, color: MUTED })
  y -= 30

  const colProduct = marginX
  const colQty = 340
  const colPrice = 400
  const colTotal = 480

  page.drawRectangle({
    x: marginX,
    y: y - 6,
    width: 595.28 - marginX * 2,
    height: 22,
    color: rgb(0.96, 0.96, 0.96),
  })
  text('ITEM', colProduct + 8, y, { size: 8.5, f: bold, color: MUTED })
  text('QTY', colQty, y, { size: 8.5, f: bold, color: MUTED })
  text('UNIT PRICE', colPrice, y, { size: 8.5, f: bold, color: MUTED })
  text('AMOUNT', colTotal, y, { size: 8.5, f: bold, color: MUTED })
  y -= 26

  const items = order.items ?? []

  for (const item of items) {
    if (y < 100) {
      page = pdfDoc.addPage([595.28, 841.89])
      y = 800
    }
    text(item.product_name, colProduct + 8, y, { size: 9.5, f: bold })
    if (item.variation_label) {
      text(item.variation_label, colProduct + 8, y - 12, { size: 8, color: MUTED })
    }
    text(String(item.quantity), colQty, y, { size: 9.5 })
    text(`Rs. ${Number(item.unit_price).toLocaleString('en-IN')}`, colPrice, y, { size: 9.5 })
    text(`Rs. ${Number(item.line_total).toLocaleString('en-IN')}`, colTotal, y, {
      size: 9.5,
      f: bold,
    })
    y -= item.variation_label ? 28 : 20
    line(y + 6)
  }

  y -= 10

  const totalsX = 380
  text('Subtotal', totalsX, y, { size: 9.5, color: MUTED })
  text(`Rs. ${Number(order.subtotal).toLocaleString('en-IN')}`, colTotal, y, { size: 9.5 })
  y -= 16

  if (Number(order.discount_amount) > 0) {
    text(
      `Discount${order.coupon_code ? ` (${order.coupon_code})` : ''}`,
      totalsX,
      y,
      { size: 9.5, color: MUTED }
    )
    text(`- Rs. ${Number(order.discount_amount).toLocaleString('en-IN')}`, colTotal, y, {
      size: 9.5,
      color: rgb(0.2, 0.5, 0.3),
    })
    y -= 16
  }

  line(y + 6)
  y -= 6
  text('TOTAL PAID', totalsX, y, { size: 11, f: bold })
  text(`Rs. ${Number(order.total).toLocaleString('en-IN')}`, colTotal, y, {
    size: 12,
    f: bold,
    color: GOLD,
  })
  y -= 60

  page.drawLine({
    start: { x: marginX, y: 70 },
    end: { x: 595.28 - marginX, y: 70 },
    thickness: 0.75,
    color: LINE,
  })
  page.drawText('Thank you for shopping with The Label 18.', {
    x: marginX,
    y: 50,
    size: 9,
    font,
    color: MUTED,
  })
  page.drawText('This is a computer-generated invoice and does not require a signature.', {
    x: marginX,
    y: 36,
    size: 8,
    font,
    color: MUTED,
  })

  return pdfDoc.save()
}