import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Demo mode when credentials are missing or still the placeholder values.
export const isDemo = !url || !key || url.includes('your-project-ref') || key.startsWith('your-')
export const supabase = isDemo ? null : createClient(url, key)
