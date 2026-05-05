import { Suspense } from 'react'
import type { Metadata } from 'next'
import { EventFilters } from '@/components/events/EventFilters'
import { EventList } from '@/components/events/EventList'
import { mockEvents } from '@/data/mock-events'
import { isToday, isTomorrow, isThisWeekend } from '@/lib/utils'
import { EVENT_TYPES } from '@/lib/constants'

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
import type { Event, EventType } from '@/types/event'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

function filterEvents(events: Event[], params: Record<string, string | undefined>): Event[] {
  let result = events.filter((e) => e.status === 'published' || e.status === 'needs_check')

  if (params.date) {
    result = result.filter((e) => {
      if (params.date === 'today') return isToday(e.event_date)
      if (params.date === 'tomorrow') return isTomorrow(e.event_date)
      if (params.date === 'this_weekend') return isThisWeekend(e.event_date)
      if (params.date === 'this_week') {
        const d = new Date(e.event_date)
        const now = new Date()
        const end = new Date(now)
        end.setDate(now.getDate() + (7 - now.getDay()))
        return d >= now && d <= end
      }
      if (params.date === 'next_week') {
        const d = new Date(e.event_date)
        const now = new Date()
        const start = new Date(now)
        start.setDate(now.getDate() + (7 - now.getDay() + 1))
        const end = new Date(start)
        end.setDate(start.getDate() + 6)
        return d >= start && d <= end
      }
      if (params.date === 'this_month') {
        const d = new Date(e.event_date)
        const now = new Date()
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }
      return true
    })
  }

  if (params.region) {
    result = result.filter((e) => {
      const district = e.district?.toLowerCase() ?? ''
      const city = e.city?.toLowerCase() ?? ''
      const regionMap: Record<string, string[]> = {
        gangnam: ['강남', '서초'],
        hongdae: ['홍대', '합정'],
        seongsu: ['성수', '건대'],
        sinchon: ['신촌', '이대'],
        jongno: ['종로', '을지로'],
        jamsil: ['잠실', '송파'],
        yeouido: ['여의도', '영등포'],
        seoul: ['서울'],
        gyeonggi: ['경기'],
        incheon: ['인천'],
        busan: ['부산'],
        daegu: ['대구'],
        daejeon: ['대전'],
        gwangju: ['광주'],
      }
      const keywords = regionMap[params.region!] ?? [params.region!]
      return keywords.some((kw) => district.includes(kw) || city.includes(kw))
    })
  }

  if (params.type) {
    result = result.filter((e) => e.event_type === params.type)
  }

  const sort = params.sort ?? 'date_asc'
  result.sort((a, b) => {
    if (sort === 'date_asc') return a.event_date.localeCompare(b.event_date)
    if (sort === 'created_desc') return b.created_at.localeCompare(a.created_at)
    if (sort === 'price_asc') return (a.price_female ?? a.price_common ?? 9999999) - (b.price_female ?? b.price_common ?? 9999999)
    if (sort === 'updated_desc') return b.updated_at.localeCompare(a.updated_at)
    return 0
  })

  return result
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const events = filterEvents(mockEvents, params)

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
