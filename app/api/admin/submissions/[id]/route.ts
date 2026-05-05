import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { getAdminClient } from '@/lib/db'

// PATCH /api/admin/submissions/[id] — 상태 변경 (승인/반려/중복)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const { status, admin_note } = await req.json()

  const allowed = ['pending', 'reviewing', 'approved', 'rejected', 'duplicate']
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: '유효하지 않은 상태값입니다.' }, { status: 400 })
  }

  const db = getAdminClient()
  const { data, error } = await db
    .from('event_submissions')
    .update({ status, admin_note: admin_note ?? null })
    .eq('id', id)
    .select('id, status')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
