import { AdminLayout } from '@/components/admin/AdminLayout'
import { CsvUploader } from './CsvUploader'

export const metadata = { title: 'CSV 업로드 | 솔로맵 Admin' }

export default function UploadPage() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">CSV 업로드</h1>
        <p className="text-sm text-gray-500 mt-1">
          업체를 먼저 업로드한 뒤 행사를 업로드하세요.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <CsvUploader />
      </div>
    </AdminLayout>
  )
}
