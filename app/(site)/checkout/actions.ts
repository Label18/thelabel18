'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function decreaseStockForOrder(items: { variation_id: string | null; quantity: number }[]) {
  try {
    for (const item of items) {
      if (!item.variation_id || !item.quantity) continue;
      
      const { data: current } = await supabaseAdmin
        .from('product_variations')
        .select('stock_quantity')
        .eq('id', item.variation_id)
        .single();

      if (current && typeof current.stock_quantity === 'number') {
        const newStock = Math.max(0, current.stock_quantity - item.quantity);
        await supabaseAdmin
          .from('product_variations')
          .update({ stock_quantity: newStock })
          .eq('id', item.variation_id);
      }
    }
    return { success: true };
  } catch (err: any) {
    console.error('Failed to decrement stock on order placement:', err);
    return { success: false, error: err?.message };
  }
}
