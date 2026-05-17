import Link from 'next/link'

const navItems = [
  { href: '/admin', label: '대시보드' },
  { href: '/admin/events', label: '행사 관리' },
  { href: '/admin/submissions', label: '제보 관리' },
  { href: '/admin/upload', label: 'CSV 업로드' },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-bold text-rose-400">솔로맵 Admin</span>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}
                className="text-sm text-gray-300 hover:text-white transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
          <Link href="/" className="text-xs text-gray-400 hover:text-white">사이트 보기 →</Link>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6">{children}</div>
    </div>
  )
}
