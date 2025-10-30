import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '오도이촌 — 캠핑장 무인 운영 · 온담 문의함 · 위브 리포트',
  description: '사장님이 잠시 자리를 비워도 캠핑장은 돌아갑니다. 무인 체크인, 온담 문의함, 위브 리포트로 운영을 자동화하세요.',
  verification: {
    other: {
      'naver-site-verification': 'a0ea06fe5bb7fa91d0b1c008ab6975543affd808',
    },
  },
  openGraph: {
    title: '오도이촌 — 캠핑장 운영 자동화',
    description: '무인 체크인 · 온담 문의함 · 위브 리포트',
    type: 'website',
    locale: 'ko_KR',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#EDE6DA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}

