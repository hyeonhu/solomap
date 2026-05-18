import Link from 'next/link'
import { EventList } from '@/components/events/EventList'
import { getWeekendEvents, getRecentEvents, getEventsByRegion } from '@/lib/queries'
import { REGION_SECTIONS } from '@/lib/constants'

export const dynamic = 'force-dynamic'

const quickFilters = [
  { label: '오늘', href: '/events?date=today' },
  { label: '내일', href: '/events?date=tomorrow' },
  { label: '이번 주말', href: '/events?date=this_weekend' },
  { label: '강남/서초', href: '/events?region=gangnam' },
  { label: '홍대/합정', href: '/events?region=hongdae' },
  { label: '성수/건대', href: '/events?region=seongsu' },
  { label: '로테이션 소개팅', href: '/events?type=rotation_dating' },
  { label: '솔로파티', href: '/events?type=solo_party' },
]

export default async function HomePage() {
  const [weekendEvents, recentEvents, ...regionalResults] = await Promise.all([
    getWeekendEvents(),
    getRecentEvents(4),
    ...REGION_SECTIONS.map((r) => getEventsByRegion(r.key, 3)),
  ])

  const regionalSections = REGION_SECTIONS
    .map((r, i) => ({ ...r, events: regionalResults[i] }))
    .filter((s) => s.events.length > 0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-10">

      {/* 히어로 */}
      <section className="text-center py-6">
        <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-2">
          이번 주 로테이션 소개팅과<br />솔로파티를 한눈에.
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          지역, 날짜, 가격, 연령대를 비교하고 원문 신청 링크로 바로 이동하세요.
        </p>
        <Link
          href="/events"
          className="inline-flex items-center bg-rose-500 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-rose-600 transition-colors"
        >
          전체 행사 보기
        </Link>
      </section>

      {/* 빠른 필터 */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">빠른 필터</h2>
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((f) => (
            <Link
              key={f.label}
              href={f.href}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-rose-400 hover:text-rose-600 transition-colors"
            >
              {f.label}
            </Link>
          ))}
        </div>
      </section>

      {/* 이번 주말 행사 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">이번 주말 행사</h2>
          <Link href="/events?date=this_weekend" className="text-sm text-rose-500 hover:underline">
            더 보기
          </Link>
        </div>
        <EventList
          events={weekendEvents}
          emptyTitle="이번 주말 등록된 행사가 없습니다"
          emptyDescription="다른 날짜 필터를 선택해 보세요."
        />
      </section>

      {/* 지역별 행사 */}
      {regionalSections.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-6">지역별 행사</h2>
          <div className="space-y-8">
            {regionalSections.map((section) => (
              <div key={section.key}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">{section.label}</h3>
                  <Link
                    href={`/events?region=${section.key}`}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    더 보기
                  </Link>
                </div>
                <EventList events={section.events} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 최근 등록 행사 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">최근 등록된 행사</h2>
          <Link href="/events" className="text-sm text-rose-500 hover:underline">
            전체 보기
          </Link>
        </div>
        <EventList events={recentEvents} />
      </section>

      {/* 행사 제보 CTA */}
      <section className="bg-rose-50 rounded-2xl p-6 text-center">
        <h2 className="font-bold text-gray-900 mb-1">행사 정보를 알고 계신가요?</h2>
        <p className="text-sm text-gray-600 mb-4">
          운영자 검수 후 솔로맵에 등록됩니다. 별도 회원가입이 필요하지 않습니다.
        </p>
        <Link
          href="/submit"
          className="inline-flex items-center bg-rose-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors"
        >
          행사 제보하기
        </Link>
      </section>

    </div>
  )
}
