import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { EventForm } from '@/components/admin/EventForm'
import { mockEvents } from '@/data/mock-events'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminEventEditPage({ params }: PageProps) {
  const { id } = await params
  const event = mockEvents.find((e) => e.id === id)
  if (!event) notFound()

  return (
    <AdminLayout>
      <div className="mb-6">
        <Link href="/admin/events" className="text-sm text-gray-500 hover:text-gray-800">← 목록으로</Link>
        <h1 className="text-xl font-bold text-gray-900 mt-2">행사 수정</h1>
        <p className="text-sm text-gray-500">{event.title}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <EventForm mode="edit" initialData={event} />
      </div>
    </AdminLayout>
  )
}
