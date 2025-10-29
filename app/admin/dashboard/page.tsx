'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import '../admin.css'
import { getCampgroundInfo, updateCampgroundInfo, type CampgroundInfo } from '../../../lib/campground'
import { campgroundService } from '@/services'
import { supabaseRest, type SupabaseCampground } from '@/services/supabaseRest'

export default function AdminDashboard() {
  const [campgroundName, setCampgroundName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showAllFeatures, setShowAllFeatures] = useState(false)
  const [campgroundInfo, setCampgroundInfo] = useState<CampgroundInfo | null>(null)
  const [showCampgroundModal, setShowCampgroundModal] = useState(false)
  const [editCampgroundInfo, setEditCampgroundInfo] = useState<CampgroundInfo>({
    id: '',
    name: '',
    contactPhone: '',
    contactEmail: '',
    address: '',
    description: ''
  })
  const [campgroundId, setCampgroundId] = useState<string>('')
  const [recentActivities, setRecentActivities] = useState<Array<{ status: string; updated_at: string }>>([])

  useEffect(() => {
    // URL에서 캠핑장 식별자 로드 (id 우선, 없으면 name)
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get('id') || undefined
    const name = urlParams.get('campground') || '오도이촌'
    setCampgroundName(name)
    
    ;(async () => {
      try {
        // Prefer Supabase
        if (supabaseRest.isEnabled()) {
          const query = id
            ? `?id=eq.${encodeURIComponent(id)}&select=*`
            : `?name=eq.${encodeURIComponent(name)}&select=*`
          const rows = await supabaseRest.select<SupabaseCampground[]>(
            'campgrounds',
            query
          )
          const row = rows && rows[0]
          if (row) {
            const mapped: CampgroundInfo = {
              id: row.id,
              name: row.name,
              contactPhone: row.contact_phone || '',
              contactEmail: row.contact_email || '',
              address: row.address || '',
              description: row.description || ''
            }
            setCampgroundInfo(mapped)
            setEditCampgroundInfo(mapped)
            setCampgroundId(row.id)
            setCampgroundName(row.name)
            setIsLoading(false)
            return
          }
        }
        const fromService = campgroundService.getAll().find(c => c.name === name)
        if (fromService) {
          const mapped: CampgroundInfo = {
            id: fromService.id,
            name: fromService.name,
            contactPhone: fromService.contactInfo?.phone || '',
            contactEmail: fromService.contactInfo?.email || '',
            address: fromService.address || '',
            description: fromService.description || ''
          }
          setCampgroundInfo(mapped)
          setEditCampgroundInfo(mapped)
          setCampgroundId(fromService.id)
          setCampgroundName(fromService.name)
        } else {
          // 기존 로컬 저장소 폴백
          const info = getCampgroundInfo()
          setCampgroundInfo(info)
          setEditCampgroundInfo(info)
          if (info?.name) setCampgroundName(info.name)
        }
      } catch {
        const info = getCampgroundInfo()
        setCampgroundInfo(info)
        setEditCampgroundInfo(info)
      }
      setIsLoading(false)
    })()
  }, [])

  // 최근 활동 로드 (Supabase reservations - 최신 3건)
  useEffect(() => {
    ;(async () => {
      if (!campgroundId || !supabaseRest.isEnabled()) return
      try {
        const rows = await supabaseRest.select<Array<{ status: string; updated_at: string }>>(
          'reservations',
          `?campground_id=eq.${campgroundId}&select=status,updated_at&order=updated_at.desc&limit=3`
        )
        setRecentActivities(rows || [])
      } catch {
        setRecentActivities([])
      }
    })()
  }, [campgroundId])

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      window.location.href = '/admin'
    }
  }

  const handleSaveCampgroundInfo = () => {
    try {
      // 1) 슈퍼어드민 측 데이터 동기화
      try {
        const all = campgroundService.getAll()
        const target = all.find(c => c.name === campgroundName)
        if (target) {
          const newName = editCampgroundInfo.name || target.name
          campgroundService.update(target.id, {
            name: newName,
            contactInfo: {
              phone: editCampgroundInfo.contactPhone || '',
              email: editCampgroundInfo.contactEmail || ''
            },
            address: editCampgroundInfo.address || '',
            description: editCampgroundInfo.description || '',
            adminUrl: `/admin/dashboard?campground=${encodeURIComponent(newName)}`,
            kioskUrl: `/kiosk?campground=${encodeURIComponent(newName)}`
          })
          if (campgroundName !== newName) {
            setCampgroundName(newName)
            const url = new URL(window.location.href)
            url.searchParams.set('campground', newName)
            window.history.replaceState({}, '', url.toString())
          }
        }
      } catch {}

      // 2) 로컬 폴백 저장소 동기화 (기존 로직 유지)
      updateCampgroundInfo(editCampgroundInfo)
      setCampgroundInfo(editCampgroundInfo)
      setShowCampgroundModal(false)
      alert('캠핑장 정보가 성공적으로 저장되었습니다!')
    } catch (error) {
      alert('캠핑장 정보 저장 중 오류가 발생했습니다.')
    }
  }

  if (isLoading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        {/* 헤더 */}
        <div className="dashboard-header">
          <div className="header-left">
            <Link href="/" className="back-link">← 메인으로</Link>
            <div className="logo">
              <span className="logo-icon">🏕️</span>
              <h1>오도이촌 캠지기 센터</h1>
            </div>
          </div>
          <div className="header-right">
            <button 
              className="action-btn secondary"
              onClick={() => setShowCampgroundModal(true)}
            >
              ⚙️ 캠핑장 정보
            </button>
            <span className="campground-name">{campgroundName}</span>
            <button onClick={handleLogout} className="logout-btn">로그아웃</button>
          </div>
        </div>

        {/* 대시보드 메인 */}
        <div className="dashboard-main">
          <div className="welcome-section">
            <h2>안녕하세요, {campgroundName}님! 👋</h2>
            <p>캠지기 센터에 오신 것을 환영합니다. 아래 기능들을 이용해보세요.</p>
          </div>

          {/* 기능 카드들 */}
          <div className="feature-grid">
            {/* 활성화된 기능들 */}
            <div className="feature-card active">
              <div className="feature-icon">🚪</div>
              <h3>무인 체크인/체크아웃</h3>
              <p>키오스크를 통한 무인 체크인/체크아웃 관리</p>
              <Link href="/admin/reservations" className="feature-link">
                <div className="feature-status">이동하기</div>
              </Link>
            </div>

            <div className="feature-card active">
              <div className="feature-icon">📋</div>
              <h3>예약 관리</h3>
              <p>캠핑장 예약 현황을 확인하고 관리하세요</p>
              <Link href="/admin/reservations" className="feature-link">
                <div className="feature-status">이동하기</div>
              </Link>
            </div>

            {/* 준비중인 기능들 */}
            <div className="feature-card disabled">
              <div className="feature-icon">🏕️</div>
              <h3>객실 관리</h3>
              <p>캠핑장 객실 정보를 등록하고 관리하세요</p>
              <div className="feature-status">준비 중</div>
            </div>

            <div className="feature-card disabled">
              <div className="feature-icon">💰</div>
              <h3>수익 관리</h3>
              <p>매출 현황과 수익 통계를 확인하세요</p>
              <div className="feature-status">준비 중</div>
            </div>

            {showAllFeatures && (
              <>
                <div className="feature-card disabled">
                  <div className="feature-icon">📊</div>
                  <h3>통계 대시보드</h3>
                  <p>예약률, 고객 만족도 등 다양한 통계를 확인하세요</p>
                  <div className="feature-status">준비 중</div>
                </div>

                <div className="feature-card disabled">
                  <div className="feature-icon">💬</div>
                  <h3>고객 문의</h3>
                  <p>고객 문의사항을 확인하고 답변하세요</p>
                  <div className="feature-status">준비 중</div>
                </div>

                <div className="feature-card disabled">
                  <div className="feature-icon">⚙️</div>
                  <h3>설정</h3>
                  <p>캠핑장 정보, 운영 시간 등을 설정하세요</p>
                  <div className="feature-status">준비 중</div>
                </div>
              </>
            )}
          </div>

          {/* 더보기 버튼 */}
          {!showAllFeatures && (
            <div className="show-more-section">
              <button 
                onClick={() => setShowAllFeatures(true)}
                className="show-more-btn"
              >
                더보기 (3개 더)
              </button>
            </div>
          )}

          {/* 빠른 액션 */}
          <div className="quick-actions">
            <h3>빠른 액션</h3>
            <div className="action-buttons">
              <Link href="/admin/reservations" className="action-btn primary">
                🚪 체크인 처리
              </Link>
              <button className="action-btn secondary">
                📊 오늘의 통계 보기
              </button>
              <button className="action-btn secondary">
                💬 새 문의 확인
              </button>
            </div>
          </div>

          {/* 최근 활동 */}
          <div className="recent-activity">
            <h3>최근 활동</h3>
            <div className="activity-list">
              {recentActivities.length === 0 ? (
                <div className="activity-item">
                  <div className="activity-content">
                    <p>최근 활동이 없습니다</p>
                  </div>
                </div>
              ) : (
                recentActivities.map((a, idx) => {
                  const icon = a.status === 'checked-in' ? '🚪' : a.status === 'checked-out' ? '🚪' : '📋'
                  const label = a.status === 'checked-in' ? '새로운 체크인이 완료되었습니다' : a.status === 'checked-out' ? '체크아웃 처리가 완료되었습니다' : `예약 상태 업데이트: ${a.status}`
                  const time = new Date(a.updated_at).toLocaleString('ko-KR')
                  return (
                    <div key={idx} className="activity-item">
                      <div className="activity-icon">{icon}</div>
                      <div className="activity-content">
                        <p>{label}</p>
                        <span className="activity-time">{time}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 캠핑장 정보 모달 */}
      {showCampgroundModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>캠핑장 정보 관리</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCampgroundModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>캠핑장 이름</label>
                <input
                  type="text"
                  value={editCampgroundInfo.name}
                  onChange={(e) => setEditCampgroundInfo({
                    ...editCampgroundInfo,
                    name: e.target.value
                  })}
                  placeholder="캠핑장 이름을 입력하세요"
                />
              </div>
              
              <div className="form-group">
                <label>연락처</label>
                <input
                  type="tel"
                  value={editCampgroundInfo.contactPhone}
                  onChange={(e) => setEditCampgroundInfo({
                    ...editCampgroundInfo,
                    contactPhone: e.target.value
                  })}
                  placeholder="연락처를 입력하세요 (예: 010-1234-5678)"
                />
              </div>
              
              <div className="form-group">
                <label>이메일</label>
                <input
                  type="email"
                  value={editCampgroundInfo.contactEmail}
                  onChange={(e) => setEditCampgroundInfo({
                    ...editCampgroundInfo,
                    contactEmail: e.target.value
                  })}
                  placeholder="이메일을 입력하세요"
                />
              </div>
              
              <div className="form-group">
                <label>주소</label>
                <input
                  type="text"
                  value={editCampgroundInfo.address}
                  onChange={(e) => setEditCampgroundInfo({
                    ...editCampgroundInfo,
                    address: e.target.value
                  })}
                  placeholder="캠핑장 주소를 입력하세요"
                />
              </div>
              
              <div className="form-group">
                <label>설명</label>
                <textarea
                  value={editCampgroundInfo.description}
                  onChange={(e) => setEditCampgroundInfo({
                    ...editCampgroundInfo,
                    description: e.target.value
                  })}
                  placeholder="캠핑장에 대한 간단한 설명을 입력하세요"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="action-btn secondary"
                onClick={() => setShowCampgroundModal(false)}
              >
                취소
              </button>
              <button 
                className="action-btn primary"
                onClick={handleSaveCampgroundInfo}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
