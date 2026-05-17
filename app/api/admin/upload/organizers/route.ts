import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { getAdminClient } from '@/lib/db'

// RFC 4180 준수 CSV 파서
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
  const results: { row: number; status: 'success' | 'error'; name: string; message?: string }[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 2
    const name = row.name || `(${rowNum}행)`

    if (!row.name?.trim()) {
      results.push({ row: rowNum, status: 'error', name, message: 'name은 필수입니다.' })
      continue
    }
    if (!row.slug?.trim()) {
      results.push({ row: rowNum, status: 'error', name, message: 'slug는 필수입니다.' })
      continue
    }
    if (!/^[a-z0-9-]+$/.test(row.slug)) {
      results.push({ row: rowNum, status: 'error', name, message: 'slug는 영문 소문자, 숫자, 하이픈만 가능합니다.' })
      continue
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
