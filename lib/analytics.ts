// 원문 링크 클릭 추적 — 외부 도구(Plausible, GA4 등) 교체 가능한 구조

export interface OutboundClickPayload {
  eventId: string
  organizerId: string | null
  sourceUrl: string
  sessionId: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export async function trackOutboundClick(payload: OutboundClickPayload): Promise<void> {
  try {
    // 내부 DB 기록
    await fetch('/api/track/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
  } catch {
    // 추적 실패가 UX에 영향 주면 안 됨
  }

  // Plausible 이벤트 (window.plausible 존재 시)
  if (typeof window !== 'undefined' && (window as any).plausible) {
    ;(window as any).plausible('Outbound Click', {
      props: { url: payload.sourceUrl },
    })
  }
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  const key = 'solomap_sid'
  let sid = sessionStorage.getItem(key)
  if (!sid) {
    sid = crypto.randomUUID()
    sessionStorage.setItem(key, sid)
  }
  return sid
}
