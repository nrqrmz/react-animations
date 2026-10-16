import { createClient } from '@supabase/supabase-js'

// These two values are PUBLIC by design (they end up in the browser bundle anyway).
// Security comes from Row Level Security (RLS) on every table, not from hiding them.
// NEVER put the service_role key here or anywhere in this repo.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(url && anonKey)

// Placeholder values keep the app running before a Supabase project is connected.
export const supabase = createClient(url || 'http://localhost:54321', anonKey || 'public-anon-key-placeholder')
