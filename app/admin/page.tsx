import Link from 'next/link'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { adminGetStats } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const stats = await adminGetStats()

  return (
    <AdminLayout>
      <h1 className="text-xl font-bold text-gray-900 mb-6">대시보드</h1>

      <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-4">
        {[
          { label: '전체 행사', value: stats.total },
          { label: '게시 중', value: stats.published },
          { label: '확인 필요', value: stats.needsCheck },
          { label: '업체 수', value: stats.organizers },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/events/new"
          className="bg-rose-500 text-white rounded-xl p-5 hover:bg-rose-600 transition-colors">
          <p className="font-semibold text-lg mb-1">+ 새 행사 등록</p>
          <p className="text-rose-100 text-sm">행사 정보를 직접 입력합니다.</p>
        </Link>
        <Link href="/admin/upload"
          className="bg-white border border-gray-200 rounded-xl p-5 hover:border-rose-300 transition-colors">
          <p className="font-semibold text-lg text-gray-900 mb-1">Excel 업로드</p>
          <p className="text-gray-500 text-sm">업체·행사 데이터를 일괄 등록합니다.</p>
        </Link>
        <Link href="/admin/submissions"
          className="bg-white border border-gray-200 rounded-xl p-5 hover:border-rose-300 transition-colors">
          <p className="font-semibold text-lg text-gray-900 mb-1">제보 검토</p>
          <p className="text-gray-500 text-sm">사용자 제보를 승인하거나 반려합니다.</p>
        </Link>
      </div>
    </AdminLayout>
  )
}
