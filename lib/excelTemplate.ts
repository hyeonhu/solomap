import ExcelJS from 'exceljs'

const ROSE_HEADER = 'FFFCE8E8'
const REQUIRED_HEADER = 'FFFB9CA1'
const GRAY_BG = 'FFF3F4F6'

function styleHeaderRow(ws: ExcelJS.Worksheet, totalCols: number) {
  const headerRow = ws.getRow(1)
  headerRow.height = 22
  for (let col = 1; col <= totalCols; col++) {
    const cell = headerRow.getCell(col)
    cell.font = { bold: true, size: 10 }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
    }
  }
}

function styleSampleRow(ws: ExcelJS.Worksheet, totalCols: number) {
  const sampleRow = ws.getRow(2)
  for (let col = 1; col <= totalCols; col++) {
    sampleRow.getCell(col).fill = {
      type: 'pattern', pattern: 'solid', fgColor: { argb: GRAY_BG },
    }
    sampleRow.getCell(col).font = { color: { argb: 'FF9CA3AF' }, italic: true, size: 9 }
  }
}

function addDropdown(
  ws: ExcelJS.Worksheet,
  cellRange: string,
  values: string[],
  errorMsg: string
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(ws as any).dataValidations.add(cellRange, {
    type: 'list',
    allowBlank: true,
    formulae: [`"${values.join(',')}"`],
    showErrorMessage: true,
    errorStyle: 'stop',
    errorTitle: '잘못된 값',
    error: errorMsg,
  })
}

// ──────────────────────────────────────────────────────────
// 업체 템플릿
// ──────────────────────────────────────────────────────────
export async function generateOrganizersTemplate(): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  wb.creator = '솔로맵'

  const ws = wb.addWorksheet('업체 데이터')

  const columns: { header: string; key: string; width: number; required?: boolean }[] = [
    { header: 'name *', key: 'name', width: 24, required: true },
    { header: 'slug *', key: 'slug', width: 24, required: true },
    { header: 'description', key: 'description', width: 36 },
    { header: 'website_url', key: 'website_url', width: 32 },
    { header: 'instagram_url', key: 'instagram_url', width: 32 },
    { header: 'kakao_url', key: 'kakao_url', width: 32 },
    { header: 'main_region', key: 'main_region', width: 16 },
    { header: 'official_status', key: 'official_status', width: 18 },
  ]

  ws.columns = columns.map(c => ({ header: c.header, key: c.key, width: c.width }))

  // 헤더 배경색 (필수 = 진한 장미, 선택 = 연한 장미)
  columns.forEach((col, i) => {
    const cell = ws.getRow(1).getCell(i + 1)
    cell.fill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: col.required ? REQUIRED_HEADER : ROSE_HEADER },
    }
  })
  styleHeaderRow(ws, columns.length)

  // 드롭다운: official_status (H열)
  addDropdown(ws, 'H3:H1000', ['unclaimed', 'hidden'],
    'unclaimed 또는 hidden만 입력 가능합니다.')

  // 참고 시트
  const ref = wb.addWorksheet('참고')
  ref.addRow(['official_status 값', '설명'])
  ref.addRow(['unclaimed', '미공식 (기본값)'])
  ref.addRow(['hidden', '숨김'])
  ref.getRow(1).font = { bold: true }

  const buf = await wb.xlsx.writeBuffer()
  return Buffer.from(buf)
}

// ──────────────────────────────────────────────────────────
// 행사 템플릿
// ──────────────────────────────────────────────────────────
export async function generateEventsTemplate(): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  wb.creator = '솔로맵'

  const ws = wb.addWorksheet('행사 데이터')

  const columns: { header: string; key: string; width: number; required?: boolean }[] = [
    { header: 'title *', key: 'title', width: 36, required: true },
    { header: 'slug *', key: 'slug', width: 32, required: true },
    { header: 'event_type *', key: 'event_type', width: 22, required: true },
    { header: 'organizer_slug *', key: 'organizer_slug', width: 24, required: true },
    { header: 'source_url *', key: 'source_url', width: 36, required: true },
    { header: 'source_type', key: 'source_type', width: 22 },
    { header: 'event_date *', key: 'event_date', width: 16, required: true },
    { header: 'start_time', key: 'start_time', width: 12 },
    { header: 'end_time', key: 'end_time', width: 12 },
    { header: 'city *', key: 'city', width: 12, required: true },
    { header: 'district', key: 'district', width: 14 },
    { header: 'venue_name', key: 'venue_name', width: 20 },
    { header: 'venue_visibility', key: 'venue_visibility', width: 18 },
    { header: 'price_male', key: 'price_male', width: 14 },
    { header: 'price_female', key: 'price_female', width: 14 },
    { header: 'price_common', key: 'price_common', width: 14 },
    { header: 'age_min_male', key: 'age_min_male', width: 14 },
    { header: 'age_max_male', key: 'age_max_male', width: 14 },
    { header: 'age_min_female', key: 'age_min_female', width: 14 },
    { header: 'age_max_female', key: 'age_max_female', width: 14 },
    { header: 'capacity_male', key: 'capacity_male', width: 14 },
    { header: 'capacity_female', key: 'capacity_female', width: 14 },
    { header: 'status', key: 'status', width: 16 },
    { header: 'summary', key: 'summary', width: 40 },
    { header: 'admin_note', key: 'admin_note', width: 30 },
  ]

  ws.columns = columns.map(c => ({ header: c.header, key: c.key, width: c.width }))

  columns.forEach((col, i) => {
    const cell = ws.getRow(1).getCell(i + 1)
    cell.fill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: col.required ? REQUIRED_HEADER : ROSE_HEADER },
    }
  })
  styleHeaderRow(ws, columns.length)

  // 드롭다운
  addDropdown(ws, 'C3:C1000',
    ['rotation_dating', 'solo_party', 'wine_party', 'coffee_meeting', 'office_worker_dating', 'age_limited_party'],
    '유효한 event_type 값을 선택하세요.')

  addDropdown(ws, 'F3:F1000',
    ['manual', 'public_page', 'user_submission', 'organizer_submission', 'partner_feed'],
    '유효한 source_type 값을 선택하세요.')

  addDropdown(ws, 'M3:M1000',
    ['after_signup', 'public'],
    'after_signup 또는 public만 입력 가능합니다.')

  addDropdown(ws, 'W3:W1000',
    ['draft', 'published', 'needs_check', 'closed', 'cancelled', 'hidden'],
    '유효한 status 값을 선택하세요.')

  // 참고 시트
  const ref = wb.addWorksheet('참고')
  const refData = [
    ['필드', '허용 값', '설명'],
    ['event_type', 'rotation_dating', '로테이션 소개팅'],
    ['', 'solo_party', '솔로파티'],
    ['', 'wine_party', '와인파티'],
    ['', 'coffee_meeting', '커피미팅'],
    ['', 'office_worker_dating', '직장인 소개팅'],
    ['', 'age_limited_party', '나이제한 파티'],
    ['source_type', 'manual', '직접 입력 (기본값)'],
    ['', 'public_page', '공개 페이지'],
    ['', 'user_submission', '사용자 제보'],
    ['', 'organizer_submission', '업체 직접 제출'],
    ['', 'partner_feed', '파트너 피드'],
    ['venue_visibility', 'after_signup', '장소 신청 후 공개 (기본값)'],
    ['', 'public', '장소 즉시 공개'],
    ['status', 'draft', '임시저장 (기본값)'],
    ['', 'published', '게시 중'],
    ['', 'needs_check', '확인 필요'],
    ['', 'closed', '마감'],
    ['', 'cancelled', '취소'],
    ['', 'hidden', '숨김'],
    ['event_date', 'YYYY-MM-DD', '예: 2024-06-01'],
    ['start_time / end_time', 'HH:MM', '예: 19:00'],
  ]
  refData.forEach(row => ref.addRow(row))
  ref.getRow(1).font = { bold: true }
  ref.getColumn(1).width = 24
  ref.getColumn(2).width = 28
  ref.getColumn(3).width = 28

  const buf = await wb.xlsx.writeBuffer()
  return Buffer.from(buf)
}

// ──────────────────────────────────────────────────────────
// XLSX 파싱 (업로드용)
// ──────────────────────────────────────────────────────────
export async function parseXLSX(buffer: ArrayBuffer): Promise<Record<string, string>[]> {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(buffer)

  const ws = wb.worksheets[0]
  const headers: string[] = []

  ws.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
    // * 제거 (필수 표시 제거)
    headers[colNumber - 1] = String(cell.value ?? '').replace(/\s*\*$/, '').trim()
  })

  const rows: Record<string, string>[] = []

  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return

    const obj: Record<string, string> = {}
    let hasValue = false

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = headers[colNumber - 1]
      if (!header) return

      let val = cell.value
      let strVal = ''

      if (val === null || val === undefined) {
        strVal = ''
      } else if (typeof val === 'object') {
        if ('richText' in val) {
          strVal = (val as ExcelJS.CellRichTextValue).richText.map(r => r.text).join('')
        } else if ('result' in val) {
          strVal = String((val as ExcelJS.CellFormulaValue).result ?? '')
        } else if ('text' in val) {
          strVal = String((val as ExcelJS.CellHyperlinkValue).text ?? '')
        } else {
          strVal = String(val)
        }
      } else {
        strVal = String(val)
      }

      obj[header] = strVal.trim()
      if (strVal.trim()) hasValue = true
    })

    if (hasValue) rows.push(obj)
  })

  return rows
}
