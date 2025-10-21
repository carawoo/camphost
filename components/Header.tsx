import Link from 'next/link'

export default function Header() {
  return (
    <header>
      <div className="wrap inner">
        <div className="logo">
          <span className="logo-mark"></span>
          <span>오도이촌</span>
          <span className="chip">베타 모집</span>
        </div>
        <nav style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link href="#apply" className="btn">
            무료 도입 신청
          </Link>
        </nav>
      </div>
    </header>
  )
}

