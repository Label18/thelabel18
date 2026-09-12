'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const PRIMARY_ADMIN_EMAIL = 'admin@thelabel18.com'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error || !data.user) {
        redirect('/login?error=Invalid email or password')
    }

    // Primary admin always goes to the dashboard
    if (data.user.email === PRIMARY_ADMIN_EMAIL) {
        redirect('/admin/dashboard')
    }

    const { data: subAdmin } = await supabase
        .from('sub_admins')
        .select('role, permissions')
        .eq('id', data.user.id)
        .maybeSingle()

    // Full admin role → dashboard
    if (subAdmin?.role === 'admin') {
        redirect('/admin/dashboard')
    }

    const permissions: string[] = subAdmin?.permissions || []

    // Send them to the first page they're actually allowed to see.
    // If they have no permissions at all, send them back to login with an error.
    if (permissions.length === 0) {
        redirect('/login?error=Your account has no assigned permissions. Contact an administrator.')
    }

    redirect(permissions[0])
}