import Link from 'next/link'

export default function ApplySection() {
  return (
    <section id="apply" className="wrap section">
      <div
        className="card apply-card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '18px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h2 className="title" style={{ margin: 0 }}>
            베타 캠핑장 10곳 모집
          </h2>
          <p className="muted" style={{ margin: '6px 0 0' }}>
            상주 없이 운영해보고, 월 리포트까지 받아보세요.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a
            className="btn"
            href="https://forms.gle/REPLACE_ME"
            target="_blank"
            rel="noopener"
          >
            무료 도입 신청
          </a>
          <a className="btn btn-outline" href="mailto:hello@odoichon.com">
            이메일 문의
          </a>
        </div>
      </div>
    </section>
  )
}

