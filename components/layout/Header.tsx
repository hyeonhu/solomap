import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-rose-500 font-bold text-xl tracking-tight">
          솔로맵
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/events" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            행사 목록
          </Link>
          <Link
            href="/submit"
            className="text-sm bg-rose-500 text-white px-3 py-1.5 rounded-lg hover:bg-rose-600 transition-colors"
          >
            행사 제보
          </Link>
        </nav>
      </div>
    </header>
  )
}
