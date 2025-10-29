import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>페이지를 찾을 수 없습니다</h2>
        <p style={{ color: '#6b7280', marginBottom: 16 }}>주소가 변경되었거나 삭제되었을 수 있어요.</p>
        <Link href="/" style={{ padding: '10px 16px', borderRadius: 8, background: '#111827', color: '#fff' }}>메인으로</Link>
      </div>
    </div>
  )
}


