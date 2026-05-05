'use client'

import { trackOutboundClick, getOrCreateSessionId } from '@/lib/analytics'

interface Props {
  eventId: string
  organizerId: string
  sourceUrl: string
}

export function OutboundLinkButton({ eventId, organizerId, sourceUrl }: Props) {
  const handleClick = async () => {
    await trackOutboundClick({
      eventId,
      organizerId,
      sourceUrl,
      sessionId: getOrCreateSessionId(),
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    })
    window.open(sourceUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={handleClick}
      className="w-full bg-rose-500 text-white py-4 rounded-xl font-semibold text-base hover:bg-rose-600 active:bg-rose-700 transition-colors"
    >
      원문에서 신청하기 →
    </button>
  )
}
