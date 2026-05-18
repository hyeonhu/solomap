import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { getAdminClient } from '@/lib/db'
import { generateSlug } from '@/lib/utils'

// GET /api/admin/events — 전체 행사 목록
// GET /api/admin/events?check_url=<url>&exclude_id=<id> — URL 중복 체크
export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(req.url)

  // URL 중복 체크 모드
  const checkUrl = searchParams.get('check_url')
  if (checkUrl) {
    const excludeId = searchParams.get('exclude_id')
    const db = getAdminClient()
    let q = db.from('events').select('id, title').eq('source_url', checkUrl).limit(1)
    if (excludeId) q = q.neq('id', excludeId)
    const { data } = await q
    const dup = (data ?? []).length > 0
    return NextResponse.json({ duplicate: dup, event: data?.[0] ?? null })
  }

  const status = searchParams.get('status')
  const db = getAdminClient()
  let query = db
    .from('events')
    .select('*, organizers(name)')
    .order('event_date', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/admin/events — 행사 등록
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const body = await req.json()

  if (!body.title || !body.source_url || !body.event_date || !body.organizer_id) {
    return NextResponse.json({ error: '필수 항목이 누락됐습니다.' }, { status: 400 })
  }

  const db = getAdminClient()

  // source_url 중복 체크
  const { data: dup } = await db
    .from('events')
    .select('id')
    .eq('source_url', body.source_url)
    .limit(1)

  if (dup && dup.length > 0) {
    return NextResponse.json({ error: '동일한 원문 링크가 이미 등록되어 있습니다.' }, { status: 409 })
  }

  const slug = generateSlug(body.title) + '-' + Date.now().toString(36)

  const { data, error } = await db.from('events').insert({
    title: body.title,
    slug,
    event_type: body.event_type,
    organizer_id: body.organizer_id,
    source_url: body.source_url,
    source_type: body.source_type ?? 'manual',
    event_date: body.event_date,
    start_time: body.start_time || null,
    end_time: body.end_time || null,
    city: body.city ?? '서울',
    district: body.district || null,
    venue_name: body.venue_name || null,
    venue_visibility: body.venue_visibility ?? 'after_signup',
    price_male: body.price_male ? Number(body.price_male) : null,
    price_female: body.price_female ? Number(body.price_female) : null,
    price_common: body.price_common ? Number(body.price_common) : null,
    age_min_male: body.age_min_male ? Number(body.age_min_male) : null,
    age_max_male: body.age_max_male ? Number(body.age_max_male) : null,
    age_min_female: body.age_min_female ? Number(body.age_min_female) : null,
    age_max_female: body.age_max_female ? Number(body.age_max_female) : null,
    capacity_male: body.capacity_male ? Number(body.capacity_male) : null,
    capacity_female: body.capacity_female ? Number(body.capacity_female) : null,
    status: body.status ?? 'draft',
    summary: body.summary || null,
    admin_note: body.admin_note || null,
    last_verified_at: body.last_verified_at || null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
