import { AdminLayout } from '@/components/admin/AdminLayout'
import { SubmissionTable } from '@/components/admin/SubmissionTable'
import type { EventSubmission } from '@/types/submission'

const mockSubmissions: EventSubmission[] = [
  {
    id: 'sub-1',
    source_url: 'https://example.com/new-event',
    title: '강남 솔로파티 5월 행사',
    organizer_name: '파티업체X',
    event_date: '2026-05-17',
    city: '서울',
    district: '강남/서초',
    memo: '인스타그램에서 발견했습니다.',
    status: 'pending',
    admin_note: null,
    created_at: '2026-05-04T10:00:00Z',
    updated_at: '2026-05-04T10:00:00Z',
  },
  {
    id: 'sub-2',
    source_url: 'https://example.com/event-2',
    title: '홍대 와인파티',
    organizer_name: null,
    event_date: '2026-05-24',
    city: '서울',
    district: '홍대/합정',
    memo: null,
    status: 'reviewing',
    admin_note: '업체 확인 중',
    created_at: '2026-05-03T15:00:00Z',
    updated_at: '2026-05-04T09:00:00Z',
  },
]

export default function AdminSubmissionsPage() {
  return (
    <AdminLayout>
      <h1 className="text-xl font-bold text-gray-900 mb-6">제보 관리</h1>
      <SubmissionTable submissions={mockSubmissions} />
    </AdminLayout>
  )
}
