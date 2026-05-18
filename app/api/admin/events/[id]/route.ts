import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { getAdminClient } from '@/lib/db'

// PUT /api/admin/events/[id] — 행사 수정
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const body = await req.json()
  const db = getAdminClient()

  const updateData: Record<string, unknown> = {}
  const fields = [
    'title','event_type','source_url','source_type','event_date','start_time','end_time',
    'city','district','venue_name','venue_visibility','status','summary','admin_note','last_verified_at',
  ]
  for (const f of fields) {
    if (body[f] !== undefined) updateData[f] = body[f] || null
  }
  const numFields = ['price_male','price_female','price_common','age_min_male','age_max_male','age_min_female','age_max_female','capacity_male','capacity_female']
  for (const f of numFields) {
    if (body[f] !== undefined) updateData[f] = body[f] ? Number(body[f]) : null
  }

  // source_url 중복 체크 (자기 자신 제외)
  if (updateData.source_url) {
    const { data: dup } = await db
      .from('events')
      .select('id, title')
      .eq('source_url', updateData.source_url as string)
      .neq('id', id)
      .limit(1)
    if (dup && dup.length > 0) {
      return NextResponse.json(
        { error: `동일한 원문 링크가 이미 등록되어 있습니다. (${(dup[0] as { title: string }).title})` },
        { status: 409 }
      )
    }
  }

  const { data, error } = await db.from('events').update(updateData).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PATCH /api/admin/events/[id] — 상태만 변경 (숨김, 마감 등)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const { status } = await req.json()
  const db = getAdminClient()

  const { data, error } = await db.from('events').update({ status }).eq('id', id).select('id, status').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/admin/events/[id] — 행사 삭제
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const db = getAdminClient()

  const { error } = await db.from('events').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
