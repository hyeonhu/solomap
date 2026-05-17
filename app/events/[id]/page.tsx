import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getEventById } from '@/lib/queries'
import { EventStatusBadge } from '@/components/events/EventStatusBadge'
import { Badge } from '@/components/common/Badge'
import { EVENT_TYPES, SOURCE_TYPES } from '@/lib/constants'
import { formatDate, formatTime, formatPrice, formatAgeRange } from '@/lib/utils'
import { OutboundLinkButton } from './OutboundLinkButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const event = await getEventById(id)
  if (!event) return { title: '행사를 찾을 수 없습니다 - 솔로맵' }

  const typeLabel = EVENT_TYPES[event.event_type] ?? event.event_type
  const title = `${event.title} - 솔로맵`
  const description = `${event.district || event.city}에서 열리는 ${typeLabel}. 날짜, 가격, 연령 조건, 신청 링크를 솔로맵에서 확인하세요.`

  return {
    title,
    description,
    openGraph: { title, description, locale: 'ko_KR', type: 'article' },
    alternates: { canonical: `/events/${event.id}` },
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params
  const event = await getEventById(id)
  if (!event) notFound()

  const isAdult = (event.age_min_male ?? 0) >= 19 || (event.age_min_female ?? 0) >= 19
  const eventTypeLabel = EVENT_TYPES[event.event_type] ?? event.event_type
  const sourceTypeLabel = SOURCE_TYPES[event.source_type] ?? event.source_type

  const priceText = event.price_common
    ? formatPrice(event.price_common)
    : event.price_male && event.price_female
    ? `남성 ${formatPrice(event.price_male)} / 여성 ${formatPrice(event.price_female)}`
    : '가격 미확인'

  const venueText = event.venue_visibility === 'after_signup'
    ? '신청 후 공개'
    : event.venue_name ?? `${event.city} ${event.district}`

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      <Link href="/events" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-800 mb-5">
        ← 목록으로
      </Link>

      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge label={eventTypeLabel} color="pink" />
          <EventStatusBadge status={event.status} />
          {isAdult && <Badge label="19+" color="red" />}
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">{event.title}</h1>
        <p className="text-sm text-gray-500">{event.organizer?.name}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-500 mb-4">행사 정보</h2>
        <dl className="space-y-3">
          {[
            { label: '일시', value: `${formatDate(event.event_date)}${event.start_time ? ` ${formatTime(event.start_time)}` : ''}${event.end_time ? ` ~ ${formatTime(event.end_time)}` : ''}` },
            { label: '장소', value: venueText },
            { label: '가격', value: priceText },
            { label: '연령 조건', value: formatAgeRange(event.age_min_male, event.age_max_male, event.age_min_female, event.age_max_female) },
            ...(event.capacity_male || event.capacity_female
              ? [{ label: '정원', value: `남성 ${event.capacity_male ?? '-'}명 / 여성 ${event.capacity_female ?? '-'}명` }]
              : []),
          ].map((row) => (
            <div key={row.label} className="flex gap-3">
              <dt className="w-20 shrink-0 text-sm text-gray-400">{row.label}</dt>
              <dd className="text-sm text-gray-800 font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>
        {event.summary && (
          <div className="mt-4 pt-4 border-t border-gray-50">
            <p className="text-sm text-gray-600">{event.summary}</p>
          </div>
        )}
      </div>

      <div className="mb-4">
        <OutboundLinkButton
          eventId={event.id}
          organizerId={event.organizer_id}
          sourceUrl={event.source_url}
        />
      </div>

      <div className="bg-amber-50 rounded-xl p-4 mb-4 text-sm text-amber-800 space-y-1">
        <p className="font-medium">⚠️ 신청 전 원문 페이지에서 최종 정보를 확인하세요.</p>
        <p className="text-amber-700 text-xs">가격, 모집 상태, 장소는 변경될 수 있습니다.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 text-xs text-gray-400 space-y-1">
        <p>정보 출처: {sourceTypeLabel}</p>
        {event.last_verified_at && <p>마지막 확인일: {formatDate(event.last_verified_at)}</p>}
        <p>원문 링크: <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="underline">{event.source_url}</a></p>
      </div>

      <div className="mt-4 text-center">
        <Link href={`/submit?ref=${event.id}&type=error`}
          className="text-sm text-gray-400 hover:text-gray-600 underline">
          정보 오류 제보
        </Link>
      </div>

    </div>
  )
}
