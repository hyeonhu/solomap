import { SubmitForm } from './SubmitForm'

export default function SubmitPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-2">행사 제보</h1>
      <p className="text-sm text-gray-500 mb-6">
        알고 계신 로테이션 소개팅·솔로파티 정보를 제보해 주세요.
        운영자 검수 후 게시됩니다. 별도 회신은 드리지 않습니다.
      </p>

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <SubmitForm />
      </div>

      <div className="mt-4 text-xs text-gray-400 text-center">
        제보해주신 정보는 운영자 검수 후 게시됩니다. 별도 회신은 드리지 않습니다.
      </div>
    </div>
  )
}
