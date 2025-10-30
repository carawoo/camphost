"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import '../admin.css'
import { supabaseRest } from '@/services/supabaseRest'
import { Card, QRCodeGenerator } from '@/components/common'
import { campgroundService } from '@/services'
import { getCampgroundInfo } from '../../../lib/campground'

type TabType = 'basic' | 'kiosk' | 'qrcode'

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<TabType>('qrcode')
  const [campgroundName, setCampgroundName] = useState('')
  const [campgroundId, setCampgroundId] = useState<string>('')
  const [loaded, setLoaded] = useState(false)
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [campgroundStatus, setCampgroundStatus] = useState<string>('')
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>(
    { visible: false, message: '', type: 'success' }
  )
  const [guidelines, setGuidelines] = useState('야간 소음 자제 부탁드립니다. 22시 이후 정숙.\n불꽃놀이는 지정된 공간에서만 가능합니다.\n분리수거는 출구 쪽 수거함을 이용해주세요.\n위급상황은 상단의 연락처로 바로 연락주세요.')

  // 기본 정보
  const [address, setAddress] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const name = params.get('campground') || ''
    const idParamRaw = params.get('id')
    setCampgroundName(name)
    ;(async () => {
      try {
        if (supabaseRest.isEnabled()) {
          // 1차: id 파라미터 우선
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
            setCampgroundStatus(row.status || 'active')
            setCampgroundId(row.id)
            setDescription(row.description || '')
            setGuidelines(row.guidelines || guidelines)
            setAddress(row.address || '')
            setContactPhone(row.contact_phone || '')
            setContactEmail(row.contact_email || '')
            setLoaded(true)
            return
          }
        }
        // Fallback to campgroundService
        const fromService = campgroundService.getAll().find(c => c.name === name)
        if (fromService) {
          setCampgroundStatus(fromService.status || 'active')
          setCampgroundId(fromService.id)
          setDescription(fromService.description || '')
          setAddress(fromService.address || '')
          setContactPhone(fromService.contactInfo?.phone || '')
          setContactEmail(fromService.contactInfo?.email || '')
        } else {
          // Final fallback to localStorage
          const info = getCampgroundInfo()
          if (info?.id) {
            setCampgroundId(info.id)
            setDescription(info.description || '')
            setAddress(info.address || '')
            setContactPhone(info.contactPhone || '')
            setContactEmail(info.contactEmail || '')
          }
        }
      } catch (err) {
        console.error('[Settings] Error loading campground:', err)
      }
      setLoaded(true)
    })()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ visible: true, message, type })
    setTimeout(() => {
      setToast({ visible: false, message: '', type: 'success' })
    }, 3000)
  }

  const handleSave = async () => {
    if (!campgroundId) {
      showToast('캠핑장 정보 로딩 중입니다. 잠시 후 다시 시도해주세요.', 'error')
      return
    }
    setSaving(true)
    try {
      const updateData = activeTab === 'kiosk'
        ? { description, guidelines }
        : { address, contact_phone: contactPhone, contact_email: contactEmail }

      // Try Supabase first if enabled
      if (supabaseRest.isEnabled()) {
        try {
          await (supabaseRest as any).update('campgrounds', updateData, `?id=eq.${campgroundId}`)
        } catch {
          await (supabaseRest as any).upsert('campgrounds', { id: campgroundId, ...updateData })
        }
      } else {
        // Fallback: Update campgroundService (only fields that exist in Campground type)
        if (activeTab === 'kiosk') {
          // Only save description to campgroundService (guidelines is Supabase-only)
          campgroundService.update(campgroundId, { description })
        } else {
          campgroundService.update(campgroundId, {
            address,
            contactInfo: {
              phone: contactPhone,
              email: contactEmail
            }
          })
        }
      }
      showToast('저장되었습니다. 키오스크 화면에 즉시 반영됩니다.', 'success')
    } catch (e: any) {
      showToast(e?.message || '저장 중 오류가 발생했습니다.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // 상태 체크: suspended, terminated만 접근 불가
  if (campgroundStatus && ['suspended', 'terminated'].includes(campgroundStatus)) {
    const statusMessages: Record<string, string> = {
      suspended: '일시정지된 캠핑장입니다. 관리자에게 문의하세요.',
      terminated: '계약이 해지된 캠핑장입니다. 이용이 불가능합니다.'
    }
    return (
      <div className="admin-dashboard">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <div className="header-left">
              <Link href={`/admin/dashboard?campground=${encodeURIComponent(campgroundName)}`} className="back-link">← 대시보드로</Link>
              <div className="logo">
                <span className="logo-icon">⚙️</span>
                <h1>설정</h1>
              </div>
            </div>
          </div>
          <div className="dashboard-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center', padding: 40, maxWidth: 600 }}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>⚠️</div>
              <h2 style={{ fontSize: 24, marginBottom: 16, color: '#ef4444' }}>접근 제한</h2>
              <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.6 }}>
                {statusMessages[campgroundStatus as keyof typeof statusMessages]}
              </p>
              <Link href="/super-admin/dashboard" style={{
                display: 'inline-block',
                marginTop: 24,
                padding: '12px 24px',
                background: '#2E3D31',
                color: '#fff',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500
              }}>
                슈퍼어드민으로 이동
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
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
            <p>캠핑장 정보와 키오스크 안내문을 관리할 수 있습니다.</p>
          </div>

          {/* 탭 네비게이션 */}
          <div style={{ borderBottom: '2px solid #e5e7eb', marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setActiveTab('qrcode')}
                style={{
                  padding: '12px 24px',
                  background: activeTab === 'qrcode' ? '#2E3D31' : 'transparent',
                  color: activeTab === 'qrcode' ? '#fff' : '#6b7280',
                  border: 'none',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  fontWeight: activeTab === 'qrcode' ? 600 : 400,
                  fontSize: 15,
                  transition: 'all 0.2s'
                }}
              >
                📱 QR 체크인
              </button>
              <button
                onClick={() => setActiveTab('kiosk')}
                style={{
                  padding: '12px 24px',
                  background: activeTab === 'kiosk' ? '#2E3D31' : 'transparent',
                  color: activeTab === 'kiosk' ? '#fff' : '#6b7280',
                  border: 'none',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  fontWeight: activeTab === 'kiosk' ? 600 : 400,
                  fontSize: 15,
                  transition: 'all 0.2s'
                }}
              >
                🏕️ 키오스크 안내문
              </button>
              <button
                onClick={() => setActiveTab('basic')}
                style={{
                  padding: '12px 24px',
                  background: activeTab === 'basic' ? '#2E3D31' : 'transparent',
                  color: activeTab === 'basic' ? '#fff' : '#6b7280',
                  border: 'none',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  fontWeight: activeTab === 'basic' ? 600 : 400,
                  fontSize: 15,
                  transition: 'all 0.2s'
                }}
              >
                📋 기본 정보
              </button>
            </div>
          </div>

          {/* QR 체크인 탭 */}
          {activeTab === 'qrcode' && campgroundId && (
            <div className="management-section" style={{ maxWidth: 800, margin: '0 auto' }}>
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 12,
                padding: 20,
                marginBottom: 24
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e40af', marginBottom: 12 }}>
                  📱 모바일 QR 체크인 시스템
                </h3>
                <p style={{ fontSize: 14, color: '#1e40af', lineHeight: 1.6, margin: 0 }}>
                  캠핑장 입구나 안내소에 QR 코드를 부착하면, 캠퍼들이 스마트폰으로 스캔하여 바로 체크인·체크아웃할 수 있습니다.
                  문자 메시지 비용 없이 무료로 제공되며, 사장님도 모바일에서 관리할 수 있습니다.
                </p>
              </div>

              <QRCodeGenerator
                campgroundId={campgroundId}
                campgroundName={campgroundName}
                size={300}
              />

              <div style={{
                marginTop: 24,
                padding: 20,
                background: '#f9fafb',
                borderRadius: 12,
                border: '1px solid #e5e7eb'
              }}>
                <h4 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 12 }}>
                  활용 가이드
                </h4>
                <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8, color: '#374151' }}>
                  <li><strong>QR 코드 설치:</strong> 다운로드 또는 프린트하여 캠핑장 입구, 안내소, 관리실 등에 부착하세요</li>
                  <li><strong>체크인:</strong> 캠퍼가 QR 코드를 스캔하면 자동으로 체크인 페이지로 이동합니다</li>
                  <li><strong>체크아웃:</strong> 캠퍼가 동일한 QR 코드로 체크아웃도 가능합니다</li>
                  <li><strong>캠핑장 정보:</strong> 체크인 완료 시 캠핑장 가이드라인과 연락처가 자동으로 표시됩니다</li>
                  <li><strong>모바일 관리:</strong> 사장님도 스마트폰으로 QR 코드를 스캔하여 관리 페이지에 접속할 수 있습니다</li>
                </ul>
              </div>
            </div>
          )}

          {/* 키오스크 안내문 탭 */}
          {activeTab === 'kiosk' && (
            <div className="management-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <Card title="사장님 안내말씀 & 이용 안내">
                <div className="space-y-3">
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
                      사장님 안내말씀 (체크인 완료 시 표시)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={6}
                      className="text-area"
                      placeholder="예) 도심과 자연을 잇는 캠핑장입니다. 편안한 휴식 되시길 바랍니다."
                      style={{
                        width: '100%',
                        padding: 12,
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: 14,
                        lineHeight: 1.6,
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div style={{ marginTop: 20 }}>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
                      이용 안내 (한 줄씩 구분)
                    </label>
                    <textarea
                      value={guidelines}
                      onChange={(e) => setGuidelines(e.target.value)}
                      rows={8}
                      className="text-area"
                      placeholder="야간 소음 자제 부탁드립니다. 22시 이후 정숙.&#10;불꽃놀이는 지정된 공간에서만 가능합니다.&#10;분리수거는 출구 쪽 수거함을 이용해주세요."
                      style={{
                        width: '100%',
                        padding: 12,
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: 14,
                        lineHeight: 1.6,
                        resize: 'vertical'
                      }}
                    />
                    <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
                      💡 줄바꿈으로 구분하면 키오스크에서 리스트 형태로 표시됩니다.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 20 }}>
                    <button
                      onClick={handleSave}
                      className="action-btn primary"
                      disabled={saving || !campgroundId}
                      style={{ minWidth: 100 }}
                    >
                      {saving ? '저장 중...' : '💾 저장'}
                    </button>
                    {!campgroundId && (
                      <span style={{ fontSize: 14, color: '#6b7280' }}>
                        캠핑장 정보를 불러오는 중입니다...
                      </span>
                    )}
                  </div>
                </div>
              </Card>

              <Card title="🎬 실시간 미리보기">
                <div style={{ background: '#FFFDF8', borderRadius: 12, padding: 20, border: '1px solid #E7E1D7', maxHeight: '70vh', overflowY: 'auto' }}>
                  <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#2E3D31', marginBottom: 16 }}>체크인 정보</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ padding: '10px 0', borderBottom: '1px solid #E7E1D7' }}>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>캠핑장</div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#2E3D31' }}>{campgroundName || '캠핑장'}</div>
                    </div>

                    {description && (
                      <div style={{ padding: '10px 0', borderBottom: '1px solid #E7E1D7' }}>
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>사장님 안내말씀</div>
                        <div style={{ fontSize: 14, lineHeight: 1.6, color: '#374151', whiteSpace: 'pre-wrap' }}>
                          {description || '(안내말씀을 입력하면 여기에 표시됩니다)'}
                        </div>
                      </div>
                    )}

                    <div style={{ padding: '10px 0', borderBottom: '1px solid #E7E1D7' }}>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>체크인/아웃</div>
                      <div style={{ fontSize: 14, color: '#374151' }}>2025년 10월 29일 ~ 2025년 10월 30일</div>
                    </div>

                    {address && (
                      <div style={{ padding: '10px 0', borderBottom: '1px solid #E7E1D7' }}>
                        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>주소</div>
                        <div style={{ fontSize: 14, color: '#374151' }}>{address}</div>
                      </div>
                    )}

                    <div style={{ padding: '10px 0', borderBottom: '1px solid #E7E1D7' }}>
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>문의</div>
                      <div style={{ fontSize: 14, color: '#374151' }}>
                        {contactPhone || '010-0000-0000'} / {contactEmail || 'info@campground.com'}
                      </div>
                    </div>
                  </div>

                  {guidelines && (
                    <div style={{ marginTop: 16, padding: 16, background: '#f9fafb', borderRadius: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#2E3D31', marginBottom: 8 }}>이용 안내</div>
                      <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
                        {guidelines.split('\n').filter(Boolean).map((g, i) => (
                          <li key={i} style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* 기본 정보 탭 */}
          {activeTab === 'basic' && (
            <div className="management-section" style={{ maxWidth: 800 }}>
              <Card title="캠핑장 기본 정보">
                <div className="space-y-3">
                  <div>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
                      캠핑장 이름
                    </label>
                    <input
                      type="text"
                      value={campgroundName}
                      disabled
                      style={{
                        width: '100%',
                        padding: 12,
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: 14,
                        background: '#f9fafb',
                        color: '#6b7280',
                        cursor: 'not-allowed'
                      }}
                    />
                    <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
                      💡 캠핑장 이름은 변경할 수 없습니다.
                    </p>
                  </div>

                  <div style={{ marginTop: 20 }}>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
                      주소
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="예) 경기도 양평군 오도이촌길 123"
                      style={{
                        width: '100%',
                        padding: 12,
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: 14
                      }}
                    />
                  </div>

                  <div style={{ marginTop: 20 }}>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
                      연락처
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="예) 010-1234-5678"
                      style={{
                        width: '100%',
                        padding: 12,
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: 14
                      }}
                    />
                  </div>

                  <div style={{ marginTop: 20 }}>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
                      이메일
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="예) info@campground.com"
                      style={{
                        width: '100%',
                        padding: 12,
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: 14
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 24 }}>
                    <button
                      onClick={handleSave}
                      className="action-btn primary"
                      disabled={saving || !campgroundId}
                      style={{ minWidth: 100 }}
                    >
                      {saving ? '저장 중...' : '💾 저장'}
                    </button>
                    {!campgroundId && (
                      <span style={{ fontSize: 14, color: '#6b7280' }}>
                        캠핑장 정보를 불러오는 중입니다...
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Toast */}
        {toast.visible && (
          <div style={{
            position: 'fixed',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: 24,
            background: toast.type === 'success' ? '#16a34a' : '#dc2626',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 8,
            boxShadow: '0 10px 20px rgba(0,0,0,.15)',
            zIndex: 50,
            fontSize: 14,
            fontWeight: 500
          }}>
            {toast.message}
          </div>
        )}
      </div>
    </div>
  )
}


