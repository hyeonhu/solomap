import { Badge } from '@/components/common/Badge'
import { EVENT_STATUS_BADGE } from '@/lib/constants'
import type { EventStatus } from '@/types/event'

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const config = EVENT_STATUS_BADGE[status] ?? { label: status, color: 'gray' }
  return <Badge label={config.label} color={config.color as any} />
}
