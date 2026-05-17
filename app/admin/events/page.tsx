import Link from 'next/link'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { adminGetAllEvents } from '@/lib/queries'

export const dynamic = 'force-dynamic'
import { EVENT_TYPES, EVENT_STATUS } from '@/lib/constants'
import { formatDateShort } from '@/lib/utils'

export default async function AdminEventsPage() {
  const events = await adminGetAllEvents()
  const today = new Date().toISOString().split('T')[0]

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">행사 관리</h1>
        <div className="flex gap-2">
          <Link href="/admin/upload"
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:border-rose-300">
            CSV 업로드
          </Link>
          <Link href="/admin/events/new"
            className="bg-rose-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-600">
            + 새 행사 등록
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['행사명', '업체', '날짜', '지역', '유형', '상태', '마지막 확인', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {events.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">
                  등록된 행사가 없습니다. CSV 업로드로 일괄 등록하거나 새 행사를 등록하세요.
                </td>
              </tr>
            ) : events.map((event) => {
              const isPastDue = event.event_date < today && event.status === 'published'
              const isStale = event.last_verified_at &&
                new Date(event.last_verified_at) < new Date(Date.now() - 7 * 86400000)

              return (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 max-w-xs">
                    <p className="font-medium text-gray-900 truncate">{event.title}</p>
                    {isPastDue && <span className="text-xs text-amber-600">종료 후보</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{event.organizer?.name}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDateShort(event.event_date)}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{event.district}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{EVENT_TYPES[event.event_type]}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      event.status === 'published' ? 'bg-green-100 text-green-700' :
                      event.status === 'needs_check' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {EVENT_STATUS[event.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {event.last_verified_at ? (
                      <span className={isStale ? 'text-amber-600 text-xs' : 'text-gray-500 text-xs'}>
                        {formatDateShort(event.last_verified_at)}
                        {isStale && ' ⚠️'}
                      </span>
                    ) : (
                      <span className="text-red-400 text-xs">미확인</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Link href={`/admin/events/${event.id}/edit`}
                        className="text-xs text-blue-600 hover:underline">수정</Link>
                      <a href={event.source_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:underline">원문</a>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
