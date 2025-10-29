"use client"

import React from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  React.useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>문제가 발생했어요</h2>
        <p style={{ color: '#6b7280', marginBottom: 16 }}>잠시 후 다시 시도해주세요. 문제가 지속되면 관리자에게 문의해주세요.</p>
        <button onClick={() => reset()} style={{ padding: '10px 16px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 0, cursor: 'pointer' }}>
          새로고침
        </button>
      </div>
    </div>
  )
}


