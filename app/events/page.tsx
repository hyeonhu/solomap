import { Suspense } from 'react'
import type { Metadata } from 'next'
import { EventFilters } from '@/components/events/EventFilters'
import { EventList } from '@/components/events/EventList'
import { getPublishedEvents } from '@/lib/queries'
import { EVENT_TYPES } from '@/lib/constants'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams
  const typeLabel = params.type ? EVENT_TYPES[params.type as keyof typeof EVENT_TYPES] : null
  const regionLabel = params.region ?? null

  const parts = [typeLabel, regionLabel].filter(Boolean)
  const title = parts.length > 0
    ? `${parts.join(' ')} 행사 - 솔로맵`
    : '행사 목록 - 솔로맵'
  const description = `로테이션 소개팅·솔로파티 일정을 지역, 날짜, 가격, 연령대로 필터링해 찾아보세요.`

  return { title, description, openGraph: { title, description, locale: 'ko_KR', type: 'website' } }
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const events = await getPublishedEvents(params)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">행사 목록</h1>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <Suspense fallback={<div className="h-24 animate-pulse bg-gray-50 rounded-lg" />}>
          <EventFilters />
        </Suspense>
      </div>

      <div className="mb-3 text-sm text-gray-500">
        총 <span className="font-semibold text-gray-800">{events.length}</span>개 행사
      </div>

      <EventList
        events={events}
        emptyTitle="조건에 맞는 행사가 없습니다"
        emptyDescription="필터를 바꾸거나 다른 날짜를 선택해 보세요."
      />
    </div>
  )
}
