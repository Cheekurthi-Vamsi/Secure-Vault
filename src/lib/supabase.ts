import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Password {
    id: string
    user_id: string
    title: string
    username: string
    password: string
    website: string
    category: 'social' | 'work' | 'finance' | 'entertainment' | 'other'
    notes: string
    pin?: string
    is_active: boolean
    last_accessed?: string
    access_count: number
    created_at: string
    updated_at: string
}
