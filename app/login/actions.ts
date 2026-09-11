'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  // This gets the email and password you typed in the form
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Connects to Supabase to verify them
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // If wrong password or user doesn't exist in Supabase
  if (error) {
    redirect('/login?error=Invalid email or password')
  }

  // If successful, redirect to the admin dashboard
  revalidatePath('/', 'layout')
  redirect('/admin/dashboard')
}