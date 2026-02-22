import { supabase } from './supabase'

export async function testSupabaseConnection() {
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase client is not initialized'
    }
  }

  try {
    // Simple test query
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('*')
      .limit(1)

    if (error) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
        error
      }
    }

    return {
      success: true,
      message: 'Successfully connected to Supabase',
      data
    }
  } catch (err) {
    return {
      success: false,
      message: `Connection error: ${err.message}`,
      error: err
    }
  }
}

export async function testSupabaseAuth() {
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase client is not initialized'
    }
  }

  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      return {
        success: false,
        message: `Auth check failed: ${error.message}`,
        error
      }
    }

    return {
      success: true,
      message: 'Auth working successfully',
      data
    }
  } catch (err) {
    return {
      success: false,
      message: `Auth error: ${err.message}`,
      error: err
    }
  }
}
