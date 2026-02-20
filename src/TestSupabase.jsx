import { useEffect } from 'react'
import { supabase } from './src/supabase'

export default function TestSupabase() {

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('SESSION:', data)
      console.log('ERROR:', error)
    })
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h2>Supabase Connection Test</h2>
      <p>Open browser console</p>
    </div>
  )
}
