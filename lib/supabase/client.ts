import { getSupabaseClient } from '@/lib/supabase'

export function createClient() {
  return getSupabaseClient()
}