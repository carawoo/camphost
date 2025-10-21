export default function Footer() {
  return (
    <footer className="wrap">
      <div
        className="footer-content"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div className="logo" style={{ marginBottom: '8px' }}>
            <span className="logo-mark"></span>
            <span>오도이촌</span>
          </div>
          <div className="muted">도심과 자연을 잇는 캠핑 운영 파트너 — 온담 & 위브</div>
        </div>
        <div
          className="muted footer-links"
          style={{ display: 'flex', gap: '16px', alignItems: 'center' }}
        >
          <a href="https://www.instagram.com/odoichon_official/" target="_blank" rel="noopener">
            Instagram
          </a>
          <span>·</span>
          <a href="mailto:hello@odoichon.com">hello@odoichon.com</a>
          <span>·</span>
          <span>© 2025 ODOICHON</span>
        </div>
      </div>
    </footer>
  )
}

