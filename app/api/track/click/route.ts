import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.eventId || !body?.sourceUrl) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  const { error } = await supabase.from('outbound_clicks').insert({
    event_id: body.eventId,
    organizer_id: body.organizerId ?? null,
    source_url: body.sourceUrl,
    session_id: body.sessionId ?? null,
    referrer: body.referrer ?? null,
    utm_source: body.utmSource ?? null,
    utm_medium: body.utmMedium ?? null,
    utm_campaign: body.utmCampaign ?? null,
  })

  if (error) {
    // 추적 실패가 사용자 경험에 영향 주면 안 됨 — 조용히 처리
    console.error('[track/click]', error.message)
  }

  return NextResponse.json({ ok: true })
}
