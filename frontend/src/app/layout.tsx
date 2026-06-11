import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Signal Desk - AI 생산성 대시보드',
  description: '매일 아침 뉴스와 할 일을 정리하는 AI 생산성 대시보드',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Navbar />
        {/* pt-12 on mobile (smaller top bar), pt-14 on desktop; pb-16 on mobile for bottom tab bar */}
        <main className="pt-12 pb-16 sm:pt-14 sm:pb-0 min-h-screen">{children}</main>
      </body>
    </html>
  )
}
