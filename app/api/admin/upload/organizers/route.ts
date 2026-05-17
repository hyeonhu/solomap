import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { getAdminClient } from '@/lib/db'
import { parseXLSX } from '@/lib/excelTemplate'

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })

  const buffer = await file.arrayBuffer()
  const rows = await parseXLSX(buffer)
  if (rows.length === 0) return NextResponse.json({ error: '데이터가 없습니다.' }, { status: 400 })

  const supabase = getAdminClient()
  const results: { row: number; status: 'success' | 'error'; name: string; message?: string }[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 2
    const name = row.name || `(${rowNum}행)`

    if (!row.name?.trim()) {
      results.push({ row: rowNum, status: 'error', name, message: 'name은 필수입니다.' }); continue
    }
    if (!row.slug?.trim()) {
      results.push({ row: rowNum, status: 'error', name, message: 'slug는 필수입니다.' }); continue
    }
    if (!/^[a-z0-9-]+$/.test(row.slug)) {
      results.push({ row: rowNum, status: 'error', name, message: 'slug는 영문 소문자, 숫자, 하이픈만 가능합니다.' }); continue
    }

    const { error } = await supabase.from('organizers').insert({
      name: row.name,
      slug: row.slug,
      description: row.description || null,
      website_url: row.website_url || null,
      instagram_url: row.instagram_url || null,
      kakao_url: row.kakao_url || null,
      main_region: row.main_region || null,
      official_status: row.official_status === 'hidden' ? 'hidden' : 'unclaimed',
    })

    if (error) results.push({ row: rowNum, status: 'error', name, message: error.message })
    else results.push({ row: rowNum, status: 'success', name })
  }

  return NextResponse.json({
    successCount: results.filter(r => r.status === 'success').length,
    errorCount: results.filter(r => r.status === 'error').length,
    results,
  })
}
