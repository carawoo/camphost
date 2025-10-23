import Link from 'next/link'

export default function Header() {
  return (
    <header>
      <div className="wrap inner">
        <div className="logo">
          <span className="logo-mark"></span>
          <span>오도이촌</span>
          <span className="chip">얼리버드 모집</span>
        </div>
        <nav style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link href="#apply" className="btn">
            얼리버드 신청
          </Link>
          <Link href="/admin" className="btn btn-outline">
            캠지기 센터
          </Link>
        </nav>
      </div>
    </header>
  )
}

