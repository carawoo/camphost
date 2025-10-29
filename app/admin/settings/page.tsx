"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import '../admin.css'
import { supabaseRest } from '@/services/supabaseRest'
import { Card } from '@/components/common'

export default function AdminSettings() {
  const [campgroundName, setCampgroundName] = useState('')
  const [campgroundId, setCampgroundId] = useState<string>('')
  const [loaded, setLoaded] = useState(false)
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>(
    { visible: false, message: '', type: 'success' }
  )
  const [guidelines, setGuidelines] = useState('야간 소음 자제 부탁드립니다. 22시 이후 정숙.\n불꽃놀이는 지정된 공간에서만 가능합니다.\n분리수거는 출구 쪽 수거함을 이용해주세요.\n위급상황은 상단의 연락처로 바로 연락주세요.')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const name = params.get('campground') || ''
    setCampgroundName(name)
    ;(async () => {
      try {
        if (supabaseRest.isEnabled()) {
          // 1차: id 파라미터 우선
          const idParamRaw = params.get('id')
          const uuidOk = idParamRaw && /^[0-9a-fA-F-]{36}$/.test(idParamRaw)
          const idParam = uuidOk ? idParamRaw : null
          let rows: any[] | null = null
          if (idParam) {
            rows = await supabaseRest.select<any[]>('campgrounds', `?id=eq.${idParam}&select=*`)
          }
          // 2차: name으로 조회 (인코딩/비인코딩 모두 시도)
          if (!rows || rows.length === 0) {
            rows = await supabaseRest.select<any[]>('campgrounds', `?name=eq.${name}&select=*`)
          }
          if ((!rows || rows.length === 0) && name) {
            rows = await supabaseRest.select<any[]>('campgrounds', `?name=eq.${encodeURIComponent(name)}&select=*`)
          }
          const row = rows && rows[0]
          if (row) {
            setCampgroundId(row.id)
            setDescription(row.description || '')
            setGuidelines(row.guidelines || guidelines)
          }
        }
      } catch {}
      setLoaded(true)
    })()
  }, [])

  const handleSave = async () => {
    if (!campgroundId) {
      setToast({ visible: true, message: '캠핑장 정보 로딩 중입니다. 잠시 후 다시 시도해주세요.', type: 'error' })
      return
    }
    setSaving(true)
    setToast({ visible: false, message: '', type: 'success' })
    try {
      // 우선 update 시도, 실패 시 upsert로 보완
      try {
        await (supabaseRest as any).update('campgrounds', { description, guidelines }, `?id=eq.${campgroundId}`)
      } catch {
        await (supabaseRest as any).upsert('campgrounds', { id: campgroundId, description, guidelines })
      }
      setToast({ visible: true, message: '저장되었습니다. 키오스크 화면에 즉시 반영됩니다.', type: 'success' })
    } catch (e: any) {
      setToast({ visible: true, message: e?.message || '저장 중 오류가 발생했습니다.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        {/* 헤더 */}
        <div className="dashboard-header">
          <div className="header-left">
            <Link href={`/admin/dashboard?campground=${encodeURIComponent(campgroundName)}`} className="back-link">← 대시보드로</Link>
            <div className="logo">
              <span className="logo-icon">⚙️</span>
              <h1>설정</h1>
            </div>
          </div>
        </div>

        <div className="dashboard-main">
          <div className="welcome-section">
            <h2>{campgroundName} 캠핑장 설정</h2>
            <p>키오스크 화면의 안내문을 수정할 수 있습니다.</p>
          </div>

          <div className="management-section" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }} className="md:grid-cols-2">
              <Card title="사장님 안내말씀 (키오스크 표시)">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">안내문</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={8}
                    className="text-area"
                    placeholder={"예) 도심과 자연을 잇는 캠핑장\n분리수거는 출구 쪽 수거함을 이용해주세요."}
                  />
                  <label className="block text-sm font-medium text-gray-700">이용 안내 (줄바꿈으로 구분)</label>
                  <textarea
                    value={guidelines}
                    onChange={(e) => setGuidelines(e.target.value)}
                    rows={6}
                    className="text-area"
                    placeholder={"야간 소음 자제 부탁드립니다. 22시 이후 정숙.\n불꽃놀이는 지정된 공간에서만 가능합니다."}
                  />
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <button onClick={handleSave} className="action-btn primary" disabled={saving || !campgroundId}>
                      {saving ? '저장 중...' : '저장'}
                    </button>
                    {!campgroundId && (
                      <span className="text-gray-500" style={{ fontSize: 14 }}>
                        캠핑장 정보를 불러오는 중입니다...
                      </span>
                    )}
                  </div>
                </div>
              </Card>

              <Card title="키오스크 미리보기">
              <div style={{ background: '#FFFDF8', borderRadius: 12, width: 'min(92vw, 560px)', padding: 24, border: '1px solid #E7E1D7' }}>
                <h4 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#2E3D31' }}>체크인 정보</h4>
                <div className="confirm-info" style={{ marginTop: 16 }}>
                  <div className="info-item">
                    <span className="label">캠핑장</span>
                    <span className="value">{campgroundName || '오도이촌'}</span>
                  </div>
                  <div className="info-item" style={{ display: 'block', borderBottom: 'none' }}>
                    <div className="label" style={{ marginBottom: 6 }}>사장님 안내말씀</div>
                    <div className="value" style={{ whiteSpace: 'pre-wrap' }}>{description || '도심과 자연을 잇는 캠핑장'}</div>
                  </div>
                  <div className="info-item">
                    <span className="label">체크인/아웃</span>
                    <span className="value">2025년 10월 29일 ~ 2025년 10월 30일</span>
                  </div>
                  <div className="info-item">
                    <span className="label">주소</span>
                    <span className="value">경기도 양평군 오도이촌</span>
                  </div>
                  <div className="info-item">
                    <span className="label">문의</span>
                    <span className="value">010-1234-5678 / carawoo96@gmail.com</span>
                  </div>
                </div>
                <div className="result-message" style={{ textAlign: 'left' }}>
                  <strong>이용 안내</strong>
                  <ul style={{ marginTop: 8, paddingLeft: 18, lineHeight: 1.7 }}>
                    {(guidelines || '').split('\n').filter(Boolean).map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                  <button className="result-btn secondary">닫기</button>
                  <button className="result-btn primary">새 체크인</button>
                </div>
              </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast.visible && (
          <div style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 24, background: toast.type === 'success' ? '#16a34a' : '#dc2626', color: '#fff', padding: '10px 16px', borderRadius: 8, boxShadow: '0 10px 20px rgba(0,0,0,.15)', zIndex: 50 }}
            onAnimationEnd={() => setToast({ ...toast, visible: false })}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  )
}


