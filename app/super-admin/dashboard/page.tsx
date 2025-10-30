'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  useCampgrounds, 
  useForm 
} from '@/hooks'
import { userService } from '@/services'
import { 
  ROUTES, 
  STATUS_LABELS, 
  SUBSCRIPTION_PLAN_LABELS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES 
} from '@/constants'
import {
  Button,
  Input,
  Modal,
  Card,
  StatusBadge,
  Spinner,
  QRCodeGenerator
} from '@/components/common'
import { Campground, FilterOptions } from '@/types'
import '../super-admin.css'
import { supabaseRest } from '@/services/supabaseRest'

export default function SuperAdminDashboard() {
  const { 
    campgrounds, 
    isLoading, 
    error, 
    addCampground, 
    updateCampground, 
    deleteCampground 
  } = useCampgrounds()
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'suspended' | 'terminated'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [metrics, setMetrics] = useState<{ total: number; active: number; admin: number; kiosk: number }>({ total: 0, active: 0, admin: 0, kiosk: 0 })
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdCampground, setCreatedCampground] = useState<Campground | null>(null)
  const [visibleCampgrounds, setVisibleCampgrounds] = useState<Campground[]>([])
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordCampground, setPasswordCampground] = useState<{ id: string; name: string; currentPassword: string } | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrCampground, setQrCampground] = useState<{ id: string; name: string } | null>(null)

  // 인증 확인
  useEffect(() => {
    const currentUser = userService.getCurrentUser()
    if (currentUser) {
      setIsAuthenticated(true)
    } else {
      window.location.replace(ROUTES.SUPER_ADMIN.LOGIN)
    }
  }, [])

  // 시스템 지표 로드 (Supabase view 우선)
  useEffect(() => {
    ;(async () => {
      try {
        if (supabaseRest.isEnabled()) {
          const rows = await supabaseRest.select<any[]>('dashboard_metrics', '?select=*')
          const r = rows && rows[0]
          if (r) {
            setMetrics({
              total: Number(r.total_campgrounds || 0),
              active: Number(r.active_systems || 0),
              admin: Number(r.admin_pages || 0),
              kiosk: Number(r.kiosk_screens || 0)
            })
            return
          }
        }
        // 폴백: 로컬 서비스 길이로 집계
        setMetrics({
          total: (visibleCampgrounds.length || campgrounds.length),
          active: (visibleCampgrounds.length ? visibleCampgrounds : campgrounds).filter(c => c.status === 'active').length,
          admin: (visibleCampgrounds.length || campgrounds.length),
          kiosk: (visibleCampgrounds.length || campgrounds.length)
        })
      } catch {
        setMetrics({
          total: (visibleCampgrounds.length || campgrounds.length),
          active: (visibleCampgrounds.length ? visibleCampgrounds : campgrounds).filter(c => c.status === 'active').length,
          admin: (visibleCampgrounds.length || campgrounds.length),
          kiosk: (visibleCampgrounds.length || campgrounds.length)
        })
      }
    })()
  }, [campgrounds, visibleCampgrounds])

  // Supabase에서 직접 캠핑장 데이터 로드 (UUID 사용)
  useEffect(() => {
    ;(async () => {
      if (!supabaseRest.isEnabled()) {
        setVisibleCampgrounds(campgrounds)
        return
      }
      try {
        const rows = await supabaseRest.select<any[]>('campgrounds', '?select=*')
        if (rows && rows.length > 0) {
          // Supabase 데이터를 Campground 타입으로 매핑 (UUID 사용)
          const supabaseCampgrounds: Campground[] = rows.map(r => ({
            id: r.id, // Supabase UUID 사용
            name: r.name,
            owner: {
              id: `owner-${r.id}`,
              name: r.owner_name || '',
              email: r.owner_email || '',
              phone: r.contact_phone || '',
              role: 'campground_owner' as const,
              createdAt: r.created_at || new Date().toISOString(),
              updatedAt: r.updated_at || new Date().toISOString()
            },
            contactInfo: {
              phone: r.contact_phone || '',
              email: r.contact_email || ''
            },
            address: r.address || '',
            description: r.description || '',
            status: r.status || 'pending',
            subscriptionPlan: r.subscription_plan || 'basic',
            lastActiveAt: r.updated_at || new Date().toISOString(),
            adminUrl: r.admin_url || '',
            kioskUrl: r.kiosk_url || '',
            createdAt: r.created_at || new Date().toISOString(),
            updatedAt: r.updated_at || new Date().toISOString()
          }))
          setVisibleCampgrounds(supabaseCampgrounds)
          return
        }
        // Fallback: 로컬 데이터 사용
        setVisibleCampgrounds(campgrounds)
      } catch {
        setVisibleCampgrounds(campgrounds)
      }
    })()
  }, [campgrounds])

  // 새 캠핑장 등록 폼
  const { formState, updateField, validateForm, resetForm } = useForm({
    name: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    contactPhone: '',
    contactEmail: '',
    address: '',
    description: '',
    subscriptionPlan: 'basic' as const
  }, {
    name: (value) => !!value && value.trim().length > 0,
    ownerName: (value) => !!value && value.trim().length > 0,
    contactPhone: (value) => !!value && value.trim().length > 0
  })

  // 필터링된 캠핑장 데이터
  const filteredCampgrounds = (visibleCampgrounds.length ? visibleCampgrounds : campgrounds).filter(campground => {
    const statusMatch = filterStatus === 'all' || campground.status === filterStatus
    const searchMatch = !searchQuery || 
      campground.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campground.owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campground.address.toLowerCase().includes(searchQuery.toLowerCase())
    
    return statusMatch && searchMatch
  })

  const handleStatusChange = async (id: string, newStatus: Campground['status']) => {
    if (confirm(`캠핑장 상태를 "${STATUS_LABELS.campground[newStatus]}"로 변경하시겠습니까?`)) {
      try {
        // 1) 로컬 데이터 업데이트
        await updateCampground(id, {
          status: newStatus,
          lastActiveAt: new Date().toISOString()
        })

        // 2) Supabase 동기화
        if (supabaseRest.isEnabled()) {
          try {
            console.log('🔍 Supabase 동기화 시작...')

            // Use visibleCampgrounds (Supabase data with UUID) instead of campgrounds (localStorage data)
            const campground = visibleCampgrounds.find(c => c.id === id)
            console.log('📍 찾은 캠핑장:', campground?.name, '(Supabase UUID:', id, ')')

            if (campground) {
              const query = `?name=eq.${encodeURIComponent(campground.name)}&select=id,status`
              console.log('🔎 Supabase 쿼리:', query)

              const rows = await supabaseRest.select<any[]>('campgrounds', query)
              console.log('📦 Supabase 조회 결과:', rows)

              const supabaseId = rows && rows[0]?.id
              const currentStatus = rows && rows[0]?.status

              if (supabaseId) {
                console.log('✅ Supabase ID 발견:', supabaseId, '(현재 상태:', currentStatus, ')')
                console.log('🔄 상태 업데이트 시도:', newStatus)

                const updateResult = await supabaseRest.update('campgrounds', { status: newStatus }, `?id=eq.${supabaseId}`)
                console.log('✅ Supabase 업데이트 성공:', updateResult)

                alert(`${SUCCESS_MESSAGES.SAVE_SUCCESS}\n\nSupabase 동기화 완료:\n• 로컬: ${STATUS_LABELS.campground[newStatus]}\n• Supabase: ${STATUS_LABELS.campground[newStatus]}`)
                return
              } else {
                console.warn('⚠️ Supabase ID를 찾을 수 없습니다')
                alert(`로컬 업데이트는 성공했으나 Supabase ID를 찾을 수 없습니다.\n\n캠핑장 이름: ${campground.name}`)
                return
              }
            } else {
              console.warn('⚠️ 로컬 캠핑장을 찾을 수 없습니다 (ID:', id, ')')
              alert(`로컬 캠핑장을 찾을 수 없습니다 (ID: ${id})`)
              return
            }
          } catch (err: any) {
            console.error('❌ Supabase 동기화 실패:', err)
            alert(`로컬 업데이트는 성공했으나 Supabase 동기화에 실패했습니다.\n\n오류: ${err?.message || String(err)}`)
            return
          }
        }

        alert(SUCCESS_MESSAGES.SAVE_SUCCESS)
      } catch (error: any) {
        console.error('❌ 전체 업데이트 실패:', error)
        alert(`${ERROR_MESSAGES.UNKNOWN_ERROR}\n\n오류: ${error?.message || String(error)}`)
      }
    }
  }

  const handleDeleteCampground = async (id: string, name: string) => {
    if (confirm(`"${name}" 캠핑장을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      try {
        // Supabase에서 삭제 (UUID 우선)
        if (supabaseRest.isEnabled()) {
          try {
            console.log('Deleting campground from Supabase:', id, name)
            await supabaseRest.delete('campgrounds', `?id=eq.${encodeURIComponent(id)}`)
            console.log('Successfully deleted from Supabase')
          } catch (error) {
            console.error('Failed to delete from Supabase:', error)
            // 에러 발생 시 사용자에게 알림
            alert(`Supabase 삭제 실패: ${error instanceof Error ? error.message : String(error)}`)
            return
          }
        }

        // 로컬 스토리지에서 삭제
        await deleteCampground(id)

        // visibleCampgrounds에서도 제거 (즉시 UI 업데이트)
        setVisibleCampgrounds(prev => prev.filter(c => c.id !== id && c.name !== name))

        alert(SUCCESS_MESSAGES.DELETE_SUCCESS)
      } catch (error) {
        console.error('Delete error:', error)
        alert(`${ERROR_MESSAGES.UNKNOWN_ERROR}\n\n${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }

  const openPasswordModal = async (campground: Campground) => {
    let currentPassword = '0000'
    if (supabaseRest.isEnabled()) {
      try {
        // 이름으로 조회 (UUID가 아닐 수도 있으므로)
        const rows = await supabaseRest.select<any[]>('campgrounds', `?name=eq.${encodeURIComponent(campground.name)}&select=id,admin_password`)
        const camp = rows && rows[0]
        if (camp) {
          if (camp.admin_password) {
            currentPassword = camp.admin_password
          }
          // 실제 Supabase UUID 사용
          setPasswordCampground({ id: camp.id, name: campground.name, currentPassword })
        } else {
          setPasswordCampground({ id: campground.id, name: campground.name, currentPassword })
        }
      } catch {
        setPasswordCampground({ id: campground.id, name: campground.name, currentPassword })
      }
    } else {
      setPasswordCampground({ id: campground.id, name: campground.name, currentPassword })
    }
    setNewPassword('')
    setShowPasswordModal(true)
  }

  const handleUpdatePassword = async () => {
    if (!passwordCampground || !newPassword.trim()) {
      alert('비밀번호를 입력해주세요.')
      return
    }

    if (!supabaseRest.isEnabled()) {
      alert('비밀번호가 변경되었습니다.')
      setShowPasswordModal(false)
      setPasswordCampground(null)
      setNewPassword('')
      return
    }

    try {
      // Supabase에서 실제 UUID를 이름으로 조회
      let targetId = passwordCampground.id
      const nameQuery = `?name=eq.${encodeURIComponent(passwordCampground.name)}&select=id`
      const rows = await supabaseRest.select<any[]>( 'campgrounds', nameQuery)
      const camp = rows && rows[0]
      if (camp?.id) {
        targetId = camp.id
      }

      await supabaseRest.update('campgrounds', { admin_password: newPassword.trim() }, `?id=eq.${targetId}`)
      alert('비밀번호가 성공적으로 변경되었습니다.')
      setShowPasswordModal(false)
      setPasswordCampground(null)
      setNewPassword('')
    } catch (error: any) {
      console.error('비밀번호 변경 오류:', error)
      const errorMsg = error?.message || '알 수 없는 오류'
      if (errorMsg.includes('admin_password') || errorMsg.includes('column')) {
        alert(`오류: Supabase 테이블에 'admin_password' 컬럼이 없습니다.\n\nSQL Editor에서 다음을 실행해주세요:\n\nALTER TABLE public.campgrounds ADD COLUMN IF NOT EXISTS admin_password TEXT DEFAULT '0000';`)
      } else {
        alert(`비밀번호 변경 중 오류가 발생했습니다.\n\n오류: ${errorMsg}`)
      }
    }
  }

  const handleAddCampground = async () => {
    if (!validateForm()) return

    try {
      const newCampgroundData = {
        name: formState.data.name,
        owner: {
          id: `owner_${Date.now()}`,
          name: formState.data.ownerName,
          email: formState.data.ownerEmail,
          phone: formState.data.ownerPhone,
          role: 'campground_owner' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        contactInfo: {
          phone: formState.data.contactPhone,
          email: formState.data.contactEmail
        },
        address: formState.data.address,
        description: formState.data.description,
        status: 'pending' as const,
        subscriptionPlan: formState.data.subscriptionPlan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        adminUrl: `/admin/dashboard?campground=${encodeURIComponent(formState.data.name)}`,
        kioskUrl: `/kiosk?campground=${encodeURIComponent(formState.data.name)}`
      }

      // Insert to Supabase first if enabled
      let createdFromDb: any = null
      if (supabaseRest.isEnabled()) {
        const payload = {
          name: newCampgroundData.name,
          owner_name: newCampgroundData.owner.name,
          owner_email: newCampgroundData.owner.email,
          contact_phone: newCampgroundData.contactInfo.phone,
          contact_email: newCampgroundData.contactInfo.email,
          address: newCampgroundData.address,
          description: newCampgroundData.description,
          status: newCampgroundData.status,
          subscription_plan: newCampgroundData.subscriptionPlan,
          admin_password: '0000' // 기본 비밀번호
        }
        const rows = await supabaseRest.upsert<any[]>('campgrounds', payload)
        createdFromDb = rows && rows[0]
        console.log('✅ Supabase 생성 완료, UUID:', createdFromDb?.id)
      }

      // Use Supabase UUID if available, otherwise addCampground will generate its own
      const dataWithId = createdFromDb?.id
        ? { ...newCampgroundData, id: createdFromDb.id }
        : newCampgroundData

      const created = await addCampground(dataWithId)
      setCreatedCampground(created as unknown as Campground)
      setShowAddModal(false)
      resetForm()
      setShowSuccessModal(true)
      alert(SUCCESS_MESSAGES.REGISTER_SUCCESS)
    } catch (error) {
      alert(ERROR_MESSAGES.UNKNOWN_ERROR)
    }
  }

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      userService.logout()
      window.location.replace(ROUTES.SUPER_ADMIN.LOGIN)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="super-admin-dashboard">
      <div className="dashboard-container">
        {/* 헤더 */}
        <div className="dashboard-header">
          <div className="header-left">
            <Link href={ROUTES.HOME} className="back-link">← 메인으로</Link>
            <div className="logo">
              <span className="logo-icon">🏕️</span>
              <h1>슈퍼 어드민 대시보드</h1>
            </div>
          </div>
          <div className="header-right">
            <Button 
              variant="primary"
              onClick={() => setShowAddModal(true)}
            >
              + 새 캠핑장 등록
            </Button>
            <Button 
              variant="secondary"
              onClick={handleLogout}
            >
              로그아웃
            </Button>
          </div>
        </div>

        {/* 전체 시스템 상태 */}
        <div className="system-status-section">
          <Card title="🔗 전체 시스템 상태" className="system-status-card">
            <div className="system-grid">
              <div className="system-item">
                <div className="system-icon">🏕️</div>
                <div className="system-info">
                  <h4>총 캠핑장</h4>
                         <p className="system-number">{metrics.total}</p>
                </div>
              </div>
              <div className="system-item">
                <div className="system-icon">✅</div>
                <div className="system-info">
                  <h4>활성 시스템</h4>
                         <p className="system-number">{metrics.active}</p>
                </div>
              </div>
              <div className="system-item">
                <div className="system-icon">📊</div>
                <div className="system-info">
                  <h4>어드민 페이지</h4>
                         <p className="system-number">{metrics.admin}</p>
                </div>
              </div>
              <div className="system-item">
                <div className="system-icon">🖥️</div>
                <div className="system-info">
                  <h4>키오스크 화면</h4>
                         <p className="system-number">{metrics.kiosk}</p>
                </div>
              </div>
            </div>
            <div className="system-actions">
              <Button 
                variant="primary"
                onClick={() => {
                  // 모든 활성 캠핑장의 어드민 페이지를 새 탭에서 열기
                  (visibleCampgrounds.length ? visibleCampgrounds : campgrounds).filter(c => c.status === 'active').forEach(campground => {
                    window.open(campground.adminUrl, '_blank')
                  })
                }}
              >
                🚀 모든 어드민 페이지 열기
              </Button>
              <Button 
                variant="secondary"
                onClick={() => {
                  // 모든 활성 캠핑장의 키오스크 페이지를 새 탭에서 열기
                  (visibleCampgrounds.length ? visibleCampgrounds : campgrounds).filter(c => c.status === 'active').forEach(campground => {
                    window.open(campground.kioskUrl, '_blank')
                  })
                }}
              >
                🖥️ 모든 키오스크 화면 열기
              </Button>
            </div>
          </Card>
        </div>

        {/* 필터 및 검색 */}
        <div className="filter-section">
          <div className="filter-buttons">
            <Button 
              variant={filterStatus === 'all' ? 'primary' : 'secondary'}
              onClick={() => setFilterStatus('all')}
            >
              전체 ({(visibleCampgrounds.length || campgrounds.length)})
            </Button>
            <Button 
              variant={filterStatus === 'active' ? 'primary' : 'secondary'}
              onClick={() => setFilterStatus('active')}
            >
              진행중 ({(visibleCampgrounds.length ? visibleCampgrounds : campgrounds).filter(c => c.status === 'active').length})
            </Button>
            <Button 
              variant={filterStatus === 'pending' ? 'primary' : 'secondary'}
              onClick={() => setFilterStatus('pending')}
            >
              대기중 ({(visibleCampgrounds.length ? visibleCampgrounds : campgrounds).filter(c => c.status === 'pending').length})
            </Button>
            <Button 
              variant={filterStatus === 'suspended' ? 'primary' : 'secondary'}
              onClick={() => setFilterStatus('suspended')}
            >
              일시정지 ({(visibleCampgrounds.length ? visibleCampgrounds : campgrounds).filter(c => c.status === 'suspended').length})
            </Button>
            <Button 
              variant={filterStatus === 'terminated' ? 'primary' : 'secondary'}
              onClick={() => setFilterStatus('terminated')}
            >
              계약해지 ({(visibleCampgrounds.length ? visibleCampgrounds : campgrounds).filter(c => c.status === 'terminated').length})
            </Button>
          </div>
          
          <div className="search-box">
            <Input
              placeholder="캠핑장 이름, 사장님 이름, 주소로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 캠핑장 목록 */}
        <div className="campgrounds-list">
          {filteredCampgrounds.length === 0 ? (
            <Card className="empty-state">
              <span className="empty-icon">🏕️</span>
              <h3>캠핑장이 없습니다</h3>
              <p>새 캠핑장을 등록하거나 검색 조건을 변경해보세요.</p>
            </Card>
          ) : (
            filteredCampgrounds.map((campground) => (
              <Card key={campground.id} className="campground-card">
                <div className="campground-header">
                  <div className="campground-info">
                    <h3>{campground.name}</h3>
                    <p className="owner">사장님: {campground.owner.name}</p>
                    <p className="address">{campground.address}</p>
                  </div>
                  <div className="campground-status">
                    <StatusBadge 
                      status={campground.status} 
                      variant="campground"
                    />
                    <span className="plan-badge">
                      {SUBSCRIPTION_PLAN_LABELS[campground.subscriptionPlan]}
                    </span>
                  </div>
                </div>
                
                <div className="campground-details">
                  <div className="detail-item">
                    <span className="label">연락처:</span>
                    <span className="value">{campground.contactInfo.phone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">이메일:</span>
                    <span className="value">{campground.contactInfo.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">등록일:</span>
                    <span className="value">{new Date(campground.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">최근 활동:</span>
                    <span className="value">{new Date(campground.lastActiveAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>

                {/* 통합 관리 섹션 */}
                <div className="integration-section">
                  <div className="integration-header">
                    <h4>🔗 통합 관리</h4>
                    <span className="integration-status">
                      {campground.status === 'active' ? '✅ 활성' : '⏸️ 비활성'}
                    </span>
                  </div>
                  <div className="integration-actions">
                    <div className="quick-actions">
                      {campground.status !== 'terminated' ? (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              // 어드민 페이지를 새 탭에서 열고 자동 로그인
                              const adminUrl = `${campground.adminUrl}&autoLogin=true`
                              window.open(adminUrl, '_blank')
                            }}
                          >
                            🚀 어드민 자동 로그인
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              // 키오스크 페이지를 새 탭에서 열고 테스트 모드
                              const kioskUrl = `${campground.kioskUrl}&testMode=true`
                              window.open(kioskUrl, '_blank')
                            }}
                          >
                            🧪 키오스크 테스트
                          </Button>
                        </>
                      ) : (
                        <div style={{ padding: '8px', color: '#ef4444', fontSize: '14px' }}>
                          삭제된 캠핑장입니다
                        </div>
                      )}
                    </div>
                           {/* 실제 per-campground 집계가 필요하면 API 추가 후 연결합니다. */}
                  </div>
                </div>

                <div className="campground-actions">
                  <div className="status-actions">
                    <select 
                      value={campground.status}
                      onChange={(e) => handleStatusChange(campground.id, e.target.value as Campground['status'])}
                      className="status-select"
                    >
                      <option value="active">진행중</option>
                      <option value="pending">대기중</option>
                      <option value="suspended">일시정지</option>
                      <option value="terminated">계약해지</option>
                    </select>
                  </div>
                  
                  <div className="link-actions">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => window.open(campground.adminUrl, '_blank')}
                    >
                      📊 어드민 관리
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setQrCampground({ id: campground.id, name: campground.name })
                        setShowQRModal(true)
                      }}
                    >
                      📱 QR 코드
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openPasswordModal(campground)}
                    >
                      🔐 비밀번호 설정
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => window.open(campground.kioskUrl, '_blank')}
                    >
                      🖥️ 키오스크 화면
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteCampground(campground.id, campground.name)}
                    >
                      🗑️ 삭제
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* 새 캠핑장 등록 모달 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="새 캠핑장 등록"
        showCloseButton={false}
      >
        <div className="modal-body">
          <Input
            label="캠핑장 이름 *"
            value={formState.data.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="캠핑장 이름을 입력하세요"
            error={formState.errors.name}
          />
          
          <Input
            label="사장님 이름 *"
            value={formState.data.ownerName}
            onChange={(e) => updateField('ownerName', e.target.value)}
            placeholder="사장님 이름을 입력하세요"
            error={formState.errors.ownerName}
          />
          
          <Input
            label="사장님 이메일"
            type="email"
            value={formState.data.ownerEmail}
            onChange={(e) => updateField('ownerEmail', e.target.value)}
            placeholder="사장님 이메일을 입력하세요"
            error={formState.errors.ownerEmail}
          />

          <Input
            label="연락처 *"
            type="tel"
            value={formState.data.contactPhone}
            onChange={(e) => updateField('contactPhone', e.target.value)}
            placeholder="연락처를 입력하세요"
            error={formState.errors.contactPhone}
          />
          
          <Input
            label="주소"
            value={formState.data.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="캠핑장 주소를 입력하세요"
            error={formState.errors.address}
          />
          
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              구독 플랜
            </label>
            <select
              value={formState.data.subscriptionPlan}
              onChange={(e) => updateField('subscriptionPlan', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="basic">베이직</option>
              <option value="premium">프리미엄</option>
              <option value="enterprise">엔터프라이즈</option>
            </select>
          </div>
        </div>
        
        <div className="modal-footer">
          <Button 
            variant="secondary"
            onClick={() => setShowAddModal(false)}
          >
            취소
          </Button>
          <Button 
            variant="primary"
            onClick={handleAddCampground}
            loading={formState.isSubmitting}
          >
            등록
          </Button>
        </div>
      </Modal>

      {/* 등록 성공 팝업 */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="캠핑장 등록 완료"
        showCloseButton={false}
      >
        <div className="success-modal-body">
          <p>
            캠핑장 "{createdCampground?.name}" 이(가) 성공적으로 등록되었습니다.
          </p>
          <div className="success-actions">
            <button
              className="btn-inline"
              onClick={() => setShowSuccessModal(false)}
            >
              닫기
            </button>
            <button
              className="btn-inline"
              onClick={() => {
                if (!createdCampground) return
                window.open(createdCampground.kioskUrl, '_blank')
              }}
            >
              🖥️ 키오스크 열기
            </button>
            <button
              className="btn-inline btn-primary-inline"
              onClick={() => {
                if (!createdCampground) return
                window.open(createdCampground.adminUrl + '&autoLogin=true', '_blank')
              }}
            >
              🚀 어드민 열기
            </button>
          </div>
        </div>
      </Modal>

      {/* 비밀번호 설정 모달 */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title={`${passwordCampground?.name} 어드민 비밀번호 설정`}
      >
        <div className="modal-body">
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
              현재 비밀번호: <strong>{passwordCampground?.currentPassword || '0000'}</strong>
            </p>
          </div>
          <Input
            label="새 비밀번호"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="새 비밀번호를 입력하세요"
          />
        </div>
        <div className="modal-footer">
          <Button
            variant="secondary"
            onClick={() => setShowPasswordModal(false)}
          >
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdatePassword}
          >
            저장
          </Button>
        </div>
      </Modal>

      {/* QR 코드 모달 */}
      <Modal
        isOpen={showQRModal}
        onClose={() => {
          setShowQRModal(false)
          setQrCampground(null)
        }}
        title={`${qrCampground?.name} QR 코드`}
      >
        <div className="modal-body" style={{ padding: '20px 0' }}>
          {qrCampground && (
            <QRCodeGenerator
              campgroundId={qrCampground.id}
              campgroundName={qrCampground.name}
              size={300}
            />
          )}
        </div>
        <div className="modal-footer">
          <Button
            variant="primary"
            onClick={() => {
              setShowQRModal(false)
              setQrCampground(null)
            }}
          >
            닫기
          </Button>
        </div>
      </Modal>
    </div>
  )
}
