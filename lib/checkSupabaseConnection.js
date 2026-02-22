import { supabase } from './supabase'

export async function checkSupabaseConnection() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return {
      connected: false,
      message: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    }
  }

  try {
    const { error } = await supabase.auth.getSession()

    if (error) {
      return {
        connected: false,
        message: error.message
      }
    }

    return {
      connected: true,
      message: 'Supabase is connected'
    }
  } catch (err) {
    return {
      connected: false,
      message: err instanceof Error ? err.message : 'Unknown error'
    }
  }
}
