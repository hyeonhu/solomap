/**
 * 공개 페이지용 Supabase 쿼리 (anon key, RLS 적용)
 * 관리자 쿼리는 adminQueries.ts 참조
 */
import { getSupabase, getAdminClient } from './db'
import type { Event } from '@/types/event'
import type { Organizer } from '@/types/organizer'

type EventWithOrganizer = Event & { organizer: Organizer | null }

// ──────────────────────────────────────────
// 날짜 헬퍼
// ──────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function tomorrowStr() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

function weekendRange(): { start: string; end: string } {
  const now = new Date()
  const day = now.getDay() // 0=일, 6=토
  const sat = new Date(now)
  sat.setDate(now.getDate() + ((6 - day + 7) % 7 || 7))
  const sun = new Date(sat)
  sun.setDate(sat.getDate() + 1)
  return { start: sat.toISOString().split('T')[0], end: sun.toISOString().split('T')[0] }
}

// ──────────────────────────────────────────
// 공개 쿼리
// ──────────────────────────────────────────

/** 행사 목록 (필터 포함) */
export async function getPublishedEvents(
  params: Record<string, string | undefined>
): Promise<EventWithOrganizer[]> {
  const supabase = getSupabase()
  let query = supabase
    .from('events')
    .select('*, organizer:organizers(*)')
    .in('status', ['published', 'needs_check'])

  // 날짜 필터
  if (params.date === 'today') {
    query = query.eq('event_date', todayStr())
  } else if (params.date === 'tomorrow') {
    query = query.eq('event_date', tomorrowStr())
  } else if (params.date === 'this_weekend') {
    const { start, end } = weekendRange()
    query = query.gte('event_date', start).lte('event_date', end)
  } else if (params.date === 'this_week') {
    const end = new Date()
    end.setDate(end.getDate() + (7 - end.getDay()))
    query = query.gte('event_date', todayStr()).lte('event_date', end.toISOString().split('T')[0])
  } else if (params.date === 'next_week') {
    const start = new Date()
    start.setDate(start.getDate() + (7 - start.getDay() + 1))
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    query = query.gte('event_date', start.toISOString().split('T')[0]).lte('event_date', end.toISOString().split('T')[0])
  } else if (params.date === 'this_month') {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    query = query.gte('event_date', `${y}-${m}-01`).lte('event_date', `${y}-${m}-31`)
  }

  // 행사 유형 필터
  if (params.type) {
    query = query.eq('event_type', params.type)
  }

  // 지역 필터
  if (params.region) {
    const regionMap: Record<string, string[]> = {
      gangnam: ['강남', '서초'],
      hongdae: ['홍대', '합정'],
      seongsu: ['성수', '건대'],
      sinchon: ['신촌', '이대'],
      jongno: ['종로', '을지로'],
      jamsil: ['잠실', '송파'],
      yeouido: ['여의도', '영등포'],
      seoul: ['서울'],
      gyeonggi: ['경기'],
      incheon: ['인천'],
      busan: ['부산'],
      daegu: ['대구'],
      daejeon: ['대전'],
      gwangju: ['광주'],
    }
    const keywords = regionMap[params.region] ?? [params.region]
    const orCond = keywords.flatMap(kw => [`district.ilike.%${kw}%`, `city.ilike.%${kw}%`]).join(',')
    query = query.or(orCond)
  }

  // 정렬
  const sort = params.sort ?? 'date_asc'
  if (sort === 'date_asc') query = query.order('event_date', { ascending: true })
  else if (sort === 'created_desc') query = query.order('created_at', { ascending: false })
  else if (sort === 'price_asc') query = query.order('price_female', { ascending: true, nullsFirst: false })
  else if (sort === 'updated_desc') query = query.order('updated_at', { ascending: false })
  else query = query.order('event_date', { ascending: true })

  const { data, error } = await query
  if (error) { console.error('getPublishedEvents:', error.message); return [] }
  return (data ?? []) as EventWithOrganizer[]
}

/** 행사 상세 (published/needs_check만) */
export async function getEventById(id: string): Promise<EventWithOrganizer | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('events')
    .select('*, organizer:organizers(*)')
    .eq('id', id)
    .in('status', ['published', 'needs_check'])
    .single()
  if (error) return null
  return data as EventWithOrganizer
}

/** 메인 최근 행사 */
export async function getRecentEvents(limit = 4): Promise<EventWithOrganizer[]> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('events')
    .select('*, organizer:organizers(*)')
    .in('status', ['published', 'needs_check'])
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data ?? []) as EventWithOrganizer[]
}

/** 메인 이번 주말 행사 */
export async function getWeekendEvents(): Promise<EventWithOrganizer[]> {
  const { start, end } = weekendRange()
  const supabase = getSupabase()
  const { data } = await supabase
    .from('events')
    .select('*, organizer:organizers(*)')
    .in('status', ['published', 'needs_check'])
    .gte('event_date', start)
    .lte('event_date', end)
    .order('event_date', { ascending: true })
  return (data ?? []) as EventWithOrganizer[]
}

/** 업체 상세 */
export async function getOrganizerById(id: string): Promise<Organizer | null> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('organizers')
    .select('*')
    .eq('id', id)
    .neq('official_status', 'hidden')
    .single()
  return data as Organizer | null
}

/** 업체별 행사 목록 */
export async function getEventsByOrganizer(organizerId: string): Promise<EventWithOrganizer[]> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('events')
    .select('*, organizer:organizers(*)')
    .eq('organizer_id', organizerId)
    .order('event_date', { ascending: false })
  return (data ?? []) as EventWithOrganizer[]
}

// ──────────────────────────────────────────
// 사이트맵용 쿼리
// ──────────────────────────────────────────

export async function getAllPublishedEventsForSitemap() {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('events')
    .select('id, updated_at')
    .eq('status', 'published')
  return data ?? []
}

export async function getAllOrganizersForSitemap() {
  const supabase = getSupabase()
  const { data } = await supabase
    .from('organizers')
    .select('id, updated_at')
    .neq('official_status', 'hidden')
  return data ?? []
}

// ──────────────────────────────────────────
// 관리자 쿼리 (Service Role Key — RLS 우회)
// ──────────────────────────────────────────

export async function adminGetAllEvents(): Promise<EventWithOrganizer[]> {
  const supabase = getAdminClient()
  const { data } = await supabase
    .from('events')
    .select('*, organizer:organizers(*)')
    .order('event_date', { ascending: false })
  return (data ?? []) as EventWithOrganizer[]
}

export async function adminGetEventById(id: string): Promise<EventWithOrganizer | null> {
  const supabase = getAdminClient()
  const { data } = await supabase
    .from('events')
    .select('*, organizer:organizers(*)')
    .eq('id', id)
    .single()
  if (!data) return null
  return data as EventWithOrganizer
}

export async function adminGetStats() {
  const supabase = getAdminClient()
  const [eventsRes, organizersRes] = await Promise.all([
    supabase.from('events').select('status'),
    supabase.from('organizers').select('id'),
  ])
  const events = eventsRes.data ?? []
  return {
    total: events.length,
    published: events.filter((e: { status: string }) => e.status === 'published').length,
    needsCheck: events.filter((e: { status: string }) => e.status === 'needs_check').length,
    organizers: (organizersRes.data ?? []).length,
  }
}
