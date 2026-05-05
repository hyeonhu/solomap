import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

// 브라우저/서버 공용 client (읽기 + 익명 INSERT)
export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || url === 'your_supabase_url') {
    throw new Error('Supabase 환경변수가 설정되지 않았습니다.')
  }
  _supabase = createClient(url, key)
  return _supabase
}

// 서버 전용 admin client — Service Role Key 필요 (관리자 CRUD)
export function getAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Supabase admin 환경변수가 설정되지 않았습니다.')
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}

// 기존 코드와의 호환을 위한 proxy (클라이언트 사이드에서만 안전하게 사용)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabase() as any)[prop]
  },
})
