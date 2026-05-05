import { AdminLoginForm } from './AdminLoginForm'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl border border-gray-200 p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-1">솔로맵 관리자</h1>
        <p className="text-sm text-gray-500 mb-6">관리자 계정으로 로그인하세요.</p>
        <AdminLoginForm />
      </div>
    </div>
  )
}
