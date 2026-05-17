import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getOrganizerById, getEventsByOrganizer } from '@/lib/queries'
import { EventList } from '@/components/events/EventList'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OrganizerDetailPage({ params }: PageProps) {
  const { id } = await params
  const [organizer, allEvents] = await Promise.all([
    getOrganizerById(id),
    getEventsByOrganizer(id),
  ])
  if (!organizer) notFound()

  const now = new Date().toISOString().split('T')[0]
  const activeEvents = allEvents.filter((e) => e.event_date >= now && (e.status === 'published' || e.status === 'needs_check'))
  const pastEvents = allEvents.filter((e) => e.event_date < now)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/events" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-800 mb-5">
        ← 행사 목록
      </Link>

      {/* 업체 정보 */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold text-gray-900">{organizer.name}</h1>
          {organizer.official_status === 'unclaimed' && (
            <span className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded">미공식</span>
          )}
        </div>
        {organizer.main_region && (
          <p className="text-sm text-gray-500 mb-3">주요 활동 지역: {organizer.main_region}</p>
        )}
        {organizer.description && (
          <p className="text-sm text-gray-600 mb-4">{organizer.description}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {organizer.website_url && (
            <a href={organizer.website_url} target="_blank" rel="noopener noreferrer"
              className="text-xs text-rose-500 border border-rose-200 px-3 py-1 rounded-full hover:bg-rose-50">
              공식 사이트
            </a>
          )}
          {organizer.instagram_url && (
            <a href={organizer.instagram_url} target="_blank" rel="noopener noreferrer"
              className="text-xs text-rose-500 border border-rose-200 px-3 py-1 rounded-full hover:bg-rose-50">
              인스타그램
            </a>
          )}
          {organizer.kakao_url && (
            <a href={organizer.kakao_url} target="_blank" rel="noopener noreferrer"
              className="text-xs text-rose-500 border border-rose-200 px-3 py-1 rounded-full hover:bg-rose-50">
              카카오
            </a>
          )}
        </div>
      </div>

      {/* 진행 중 행사 */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-gray-900 mb-4">진행 중 행사</h2>
        <EventList
          events={activeEvents}
          emptyTitle="현재 진행 중인 행사가 없습니다"
        />
      </section>

      {/* 지난 행사 */}
      {pastEvents.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-4">지난 행사</h2>
          <EventList events={pastEvents} />
        </section>
      )}

      {/* 정보 수정 요청 */}
      <div className="mt-8 text-center">
        <Link href={`/submit?ref=${organizer.id}&type=organizer_edit`}
          className="text-sm text-gray-400 hover:text-gray-600 underline">
          업체 정보 수정 요청
        </Link>
      </div>
    </div>
  )
}
