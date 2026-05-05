import Link from 'next/link'
import { Badge } from '@/components/common/Badge'
import { EventStatusBadge } from './EventStatusBadge'
import { EVENT_TYPES } from '@/lib/constants'
import { formatDateShort, formatTime, formatPrice, formatAgeRange } from '@/lib/utils'
import type { Event } from '@/types/event'

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const isAdult =
    (event.age_min_male ?? 0) >= 19 || (event.age_min_female ?? 0) >= 19

  return (
    <Link href={`/events/${event.id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-100 p-4 hover:border-rose-200 hover:shadow-sm transition-all">
        {/* 상단: 유형 배지 + 상태 */}
        <div className="flex items-center gap-2 mb-2">
          <Badge label={EVENT_TYPES[event.event_type] ?? event.event_type} color="pink" />
          <EventStatusBadge status={event.status} />
          {isAdult && <Badge label="19+" color="red" />}
        </div>

        {/* 행사명 */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-3 group-hover:text-rose-600 transition-colors line-clamp-2">
          {event.title}
        </h3>

        {/* 핵심 정보 */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
          <div className="flex gap-1">
            <dt className="text-gray-400">일시</dt>
            <dd className="font-medium text-gray-800">
              {formatDateShort(event.event_date)}
              {event.start_time && ` ${formatTime(event.start_time)}`}
            </dd>
          </div>
          <div className="flex gap-1">
            <dt className="text-gray-400">지역</dt>
            <dd className="font-medium text-gray-800">{event.district || event.city}</dd>
          </div>
          <div className="flex gap-1">
            <dt className="text-gray-400">가격</dt>
            <dd className="font-medium text-gray-800">
              {event.price_common
                ? formatPrice(event.price_common)
                : event.price_male && event.price_female
                ? `남 ${formatPrice(event.price_male)} / 여 ${formatPrice(event.price_female)}`
                : '가격 미확인'}
            </dd>
          </div>
          <div className="flex gap-1">
            <dt className="text-gray-400">연령</dt>
            <dd className="font-medium text-gray-800">
              {formatAgeRange(event.age_min_male, event.age_max_male, event.age_min_female, event.age_max_female)}
            </dd>
          </div>
        </dl>

        {/* 업체명 */}
        <p className="mt-3 text-xs text-gray-400">
          {event.organizer?.name ?? event.organizer_id}
        </p>
      </div>
    </Link>
  )
}
