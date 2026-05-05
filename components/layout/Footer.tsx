import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-16">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
            <Link href="/legal/terms" className="hover:text-gray-800 transition-colors">이용약관</Link>
            <Link href="/legal/privacy" className="hover:text-gray-800 transition-colors">개인정보처리방침</Link>
            <Link href="/legal/posting-policy" className="hover:text-gray-800 transition-colors">정보 게시 정책</Link>
            <Link href="/submit" className="hover:text-gray-800 transition-colors">행사 제보</Link>
          </div>
          <p className="text-xs text-gray-400">
            솔로맵은 공개된 행사 정보를 수집하여 제공하는 정보 포털 서비스입니다.
            자체 결제·예약·환불을 수행하지 않으며, 신청은 원문 페이지에서 직접 진행해 주세요.
          </p>
          <p className="text-xs text-gray-400">© 2026 솔로맵. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
