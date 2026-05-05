import { NextRequest, NextResponse } from 'next/server'
import { getClientIp, hashIp, checkRateLimit } from '@/lib/rateLimit'
import { verifyTurnstile } from '@/lib/turnstile'
import { supabase } from '@/lib/db'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const ipHash = hashIp(ip)
  const userAgent = req.headers.get('user-agent') ?? ''

  // 1. Rate Limit 체크
  const { allowed, reason } = checkRateLimit(ipHash)
  if (!allowed) {
    await logAbuse(ipHash, userAgent, '', 'rate_limited')
    return NextResponse.json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.source_url || !body?.title) {
    return NextResponse.json({ error: '필수 항목이 누락됐습니다.' }, { status: 400 })
  }

  // 2. Turnstile CAPTCHA 검증
  const turnstileToken = body.cf_turnstile_response ?? ''
  const captchaOk = await verifyTurnstile(turnstileToken)
  if (!captchaOk) {
    return NextResponse.json({ error: 'CAPTCHA 인증에 실패했습니다.' }, { status: 400 })
  }

  // 3. 최근 7일 내 동일 source_url 중복 체크
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const { data: existing } = await supabase
    .from('event_submissions')
    .select('id')
    .eq('source_url', body.source_url)
    .gte('created_at', sevenDaysAgo)
    .limit(1)

  if (existing && existing.length > 0) {
    await logAbuse(ipHash, userAgent, body.source_url, 'duplicate_candidate')
    return NextResponse.json({ error: '이미 제보된 행사입니다. (최근 7일 이내 동일 링크)' }, { status: 409 })
  }

  // 4. 과도한 제보 감지 → auto_hold
  // (Rate Limit을 이미 통과했지만 추가 모니터링)
  const { data: recentByIp } = await supabase
    .from('submission_abuse_logs')
    .select('id')
    .eq('ip_hash', ipHash)
    .gte('submitted_at', new Date(Date.now() - 3600000).toISOString())

  const autoHold = (recentByIp?.length ?? 0) >= 8

  // 5. 제보 저장
  const { error: insertError } = await supabase.from('event_submissions').insert({
    source_url: body.source_url,
    title: body.title ?? null,
    organizer_name: body.organizer_name ?? null,
    event_date: body.event_date ?? null,
    city: body.city ?? null,
    district: body.district ?? null,
    memo: body.memo ?? null,
    status: autoHold ? 'pending' : 'pending',
    admin_note: autoHold ? '[자동 보류: 단시간 다량 제보 감지]' : null,
  })

  if (insertError) {
    console.error('[submissions] insert error:', insertError)
    return NextResponse.json({ error: '저장에 실패했습니다.' }, { status: 500 })
  }

  // 6. 어뷰징 로그 기록
  await logAbuse(ipHash, userAgent, body.source_url, autoHold ? 'auto_hold' : 'allowed')

  return NextResponse.json({ ok: true })
}

async function logAbuse(ipHash: string, userAgent: string, sourceUrl: string, action: string) {
  await supabase.from('submission_abuse_logs').insert({
    ip_hash: ipHash,
    user_agent: userAgent,
    source_url: sourceUrl,
    action,
  }).then(() => {})
}
