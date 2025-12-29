/**
 * Supabase Client Configuration
 * File này khởi tạo và export Supabase client để sử dụng trong toàn bộ ứng dụng
 */

import { createClient } from '@supabase/supabase-js'

// Lấy environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Kiểm tra xem đã có credentials chưa
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Thiếu Supabase credentials! Vui lòng tạo file .env và thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY'
  )
}

// Tạo Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Export types để sử dụng trong TypeScript
export type { User, Session } from '@supabase/supabase-js'
