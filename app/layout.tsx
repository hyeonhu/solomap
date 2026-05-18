import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: '솔로맵 - 로테이션 소개팅·솔로파티 한눈에',
  description: '로테이션 소개팅과 솔로파티 일정을 한눈에 비교하고, 원문 신청 링크로 바로 이동하세요.',
  openGraph: {
    title: '솔로맵 - 로테이션 소개팅·솔로파티 한눈에',
    description: '지역, 날짜, 가격, 연령대를 비교하고 원문 신청 링크로 바로 이동하세요.',
    locale: 'ko_KR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN

  return (
    <html lang="ko" className={`${geist.variable} h-full antialiased`} style={{ colorScheme: 'light' }}>
      <head>
        {plausibleDomain && (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FSSCVLHVYD"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-FSSCVLHVYD');
        `}</Script>
      </head>
      <body className="min-h-full flex flex-col bg-gray-50 font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
