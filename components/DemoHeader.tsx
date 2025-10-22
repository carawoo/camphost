import Link from 'next/link'

export default function DemoHeader() {
  return (
    <header className="demo-header">
      <div className="wrap">
        <div className="logo">
          <span className="logo-mark"></span>
          <span>오도이촌</span>
          <span className="chip">데모</span>
        </div>
        <nav>
          <Link href="/" className="btn btn-outline">메인으로</Link>
        </nav>
      </div>
    </header>
  )
}
