import { AdminLayout } from '@/components/admin/AdminLayout'
import { EventForm } from '@/components/admin/EventForm'
import Link from 'next/link'

export default function AdminEventNewPage() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <Link href="/admin/events" className="text-sm text-gray-500 hover:text-gray-800">← 목록으로</Link>
        <h1 className="text-xl font-bold text-gray-900 mt-2">새 행사 등록</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <EventForm mode="create" />
      </div>
    </AdminLayout>
  )
}
