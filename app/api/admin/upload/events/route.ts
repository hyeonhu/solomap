import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { getAdminClient } from '@/lib/db'

const VALID_EVENT_TYPES = ['rotation_dating', 'solo_party', 'wine_party', 'coffee_meeting', 'office_worker_dating', 'age_limited_party']
const VALID_STATUSES = ['draft', 'published', 'closed', 'cancelled', 'hidden', 'needs_check']
const VALID_SOURCE_TYPES = ['public_page', 'user_submission', 'organizer_submission', 'partner_feed', 'manual']
const VALID_VENUE_VISIBILITY = ['public', 'after_signup']

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current); current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n')
  if (lines.length < 2) return []
  const headers = parseCSVLine(lines[0]).map(h => h.trim())
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const values = parseCSVLine(line)
    return Object.fromEntries(headers.map((h, i) => [h, (values[i] ?? '').trim()]))
  })
}

function toInt(val: string): number | null {
  const n = parseInt(val)
  return isNaN(n) ? null : n
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })

  const text = await file.text()
  const rows = parseCSV(text)
  if (rows.length === 0) return NextResponse.json({ error: '데이터가 없습니다.' }, { status: 400 })

  const supabase = getAdminClient()
  const results: { row: number; status: 'success' | 'error'; title: string; message?: string }[] = []

  // organizer_slug → id 캐시 (중복 조회 방지)
  const slugCache: Record<string, string> = {}

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 2
    const title = row.title || `(${rowNum}행)`

    // 필수 필드 검증
    if (!row.title?.trim()) {
      results.push({ row: rowNum, status: 'error', title, message: 'title은 필수입니다.' }); continue
    }
    if (!row.slug?.trim()) {
      results.push({ row: rowNum, status: 'error', title, message: 'slug는 필수입니다.' }); continue
    }
    if (!VALID_EVENT_TYPES.includes(row.event_type)) {
      results.push({ row: rowNum, status: 'error', title, message: `event_type이 올바르지 않습니다: ${row.event_type}` }); continue
    }
    if (!row.organizer_slug?.trim()) {
      results.push({ row: rowNum, status: 'error', title, message: 'organizer_slug는 필수입니다.' }); continue
    }
    if (!row.source_url?.trim()) {
      results.push({ row: rowNum, status: 'error', title, message: 'source_url은 필수입니다.' }); continue
    }
    if (!row.event_date?.trim()) {
      results.push({ row: rowNum, status: 'error', title, message: 'event_date는 필수입니다. (YYYY-MM-DD)' }); continue
    }
    if (!row.city?.trim()) {
      results.push({ row: rowNum, status: 'error', title, message: 'city는 필수입니다.' }); continue
    }

    // organizer_slug → id 조회
    let organizerId = slugCache[row.organizer_slug]
    if (!organizerId) {
      const { data } = await supabase
        .from('organizers')
        .select('id')
        .eq('slug', row.organizer_slug)
        .single()
      if (!data) {
        results.push({ row: rowNum, status: 'error', title, message: `업체를 찾을 수 없습니다: ${row.organizer_slug}` }); continue
      }
      slugCache[row.organizer_slug] = data.id
      organizerId = data.id
    }

    const { error } = await supabase.from('events').insert({
      title: row.title,
      slug: row.slug,
      event_type: row.event_type,
      organizer_id: organizerId,
      source_url: row.source_url,
      source_type: VALID_SOURCE_TYPES.includes(row.source_type) ? row.source_type : 'manual',
      event_date: row.event_date,
      start_time: row.start_time || null,
      end_time: row.end_time || null,
      city: row.city,
      district: row.district || null,
      venue_name: row.venue_name || null,
      venue_visibility: VALID_VENUE_VISIBILITY.includes(row.venue_visibility) ? row.venue_visibility : 'after_signup',
      price_male: toInt(row.price_male),
      price_female: toInt(row.price_female),
      price_common: toInt(row.price_common),
      age_min_male: toInt(row.age_min_male),
      age_max_male: toInt(row.age_max_male),
      age_min_female: toInt(row.age_min_female),
      age_max_female: toInt(row.age_max_female),
      capacity_male: toInt(row.capacity_male),
      capacity_female: toInt(row.capacity_female),
      status: VALID_STATUSES.includes(row.status) ? row.status : 'draft',
      summary: row.summary || null,
      admin_note: row.admin_note || null,
    })

    if (error) results.push({ row: rowNum, status: 'error', title, message: error.message })
    else results.push({ row: rowNum, status: 'success', title })
  }

  return NextResponse.json({
    successCount: results.filter(r => r.status === 'success').length,
    errorCount: results.filter(r => r.status === 'error').length,
    results,
  })
}
