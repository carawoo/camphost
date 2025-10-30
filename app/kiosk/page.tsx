'use client'

import { useState, useEffect } from 'react'
import './page.css'
import { 
  getReservations, 
  findReservation, 
  updateReservationStatus,
  type Reservation 
} from '../../lib/reservations'
import { getCampgroundInfo, type CampgroundInfo } from '../../lib/campground'
import { campgroundService } from '@/services'
import { supabaseRest, type SupabaseCampground } from '@/services/supabaseRest'

export default function CheckInKiosk() {
  const [mode, setMode] = useState<'checkin' | 'checkout'>('checkin')
  const [step, setStep] = useState<'search' | 'confirm' | 'success' | 'error' | 'already-done'>('search')
  const [searchForm, setSearchForm] = useState({
    guestName: '',
    phone: ''
  })
  const [foundReservation, setFoundReservation] = useState<Reservation | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [campgroundInfo, setCampgroundInfo] = useState<CampgroundInfo | null>(null)
  const [guidelines, setGuidelines] = useState<string>('')
  const [campgroundId, setCampgroundId] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [campgroundStatus, setCampgroundStatus] = useState<string>('')
  const [actualCheckinTime, setActualCheckinTime] = useState<string | null>(null)
  const [actualCheckoutTime, setActualCheckoutTime] = useState<string | null>(null)
  const [charcoalEnabled, setCharcoalEnabled] = useState(false)
  const [charcoalTimeOptions, setCharcoalTimeOptions] = useState<string[]>([])
  const [selectedCharcoalTime, setSelectedCharcoalTime] = useState<string | null>(null)
  const [showCharcoalSelection, setShowCharcoalSelection] = useState(false)

  // 캠핑장 정보 로드 (Supabase 우선, 폴백은 로컬)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get('id') || undefined
    const name = urlParams.get('campground') || undefined
    try {
      if ((id || name) && supabaseRest.isEnabled()) {
        (async () => {
          const query = id
            ? `?id=eq.${encodeURIComponent(id)}&select=*`
            : `?name=eq.${encodeURIComponent(name!)}&select=*`
          const rows = await supabaseRest.select<SupabaseCampground[]>('campgrounds', query)
          const row = rows && rows[0]
          if (row) {
            setCampgroundStatus(row.status || 'active')
            // 상태 체크: pending, suspended, terminated는 접근 불가
            if (row.status && ['pending', 'suspended', 'terminated'].includes(row.status)) {
              return
            }
            setCampgroundInfo({
              id: row.id,
              name: row.name,
              contactPhone: row.contact_phone || '',
              contactEmail: row.contact_email || '',
              address: row.address || '',
              description: row.description || ''
            })
            setGuidelines(row.guidelines || '')
            setCampgroundId(row.id)
            setCharcoalEnabled(row.enable_charcoal_reservation || false)
            setCharcoalTimeOptions(row.charcoal_time_options || [])
            return
          }
          // fallback below
          const target = campgroundService.getAll().find(c => c.name === name)
          if (target) {
            setCampgroundStatus(target.status || 'active')
            // 상태 체크: pending, suspended, terminated는 접근 불가
            if (target.status && ['pending', 'suspended', 'terminated'].includes(target.status)) {
              return
            }
            setCampgroundInfo({
              id: target.id,
              name: target.name,
              contactPhone: target.contactInfo?.phone || '',
              contactEmail: target.contactInfo?.email || '',
              address: target.address || '',
              description: target.description || ''
            })
            setCampgroundId(target.id)
          } else {
            const info = getCampgroundInfo()
            setCampgroundInfo(info)
            if (info?.id) setCampgroundId(info.id)
          }
        })()
        return
      }
      if (name) {
        const target = campgroundService.getAll().find(c => c.name === name)
        if (target) {
          setCampgroundStatus(target.status || 'active')
          // 상태 체크: pending, suspended, terminated는 접근 불가
          if (target.status && ['pending', 'suspended', 'terminated'].includes(target.status)) {
            return
          }
          const mapped: CampgroundInfo = {
            id: target.id,
            name: target.name,
            contactPhone: target.contactInfo?.phone || '',
            contactEmail: target.contactInfo?.email || '',
            address: target.address || '',
            description: target.description || ''
          }
          setCampgroundInfo(mapped)
          setCampgroundId(target.id)
          return
        }
      }
    } catch {}
    const info = getCampgroundInfo()
    setCampgroundInfo(info)
    if (info?.id) setCampgroundId(info.id)
  }, [])

  // URL 파라미터에서 정보 가져오기
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const guestName = urlParams.get('guestName')
    const phone = urlParams.get('phone')
    const testMode = urlParams.get('testMode')
    
    if (testMode === 'true') {
      // 테스트 모드일 때 자동으로 체크인 시뮬레이션
      setSearchForm({
        guestName: '테스트 고객',
        phone: '010-1234-5678'
      })
      setTimeout(() => {
        simulateCheckIn()
      }, 2000)
    } else if (guestName && phone) {
      setSearchForm({
        guestName: decodeURIComponent(guestName),
        phone: decodeURIComponent(phone)
      })
      // 자동으로 검색 실행
      setTimeout(() => {
        handleSearchWithParams(decodeURIComponent(guestName), decodeURIComponent(phone))
      }, 500)
    }
  }, [])

  const simulateCheckIn = () => {
    // 테스트용 예약 데이터 생성
    const testReservation: Reservation = {
      id: 'test_' + Date.now(),
      guestName: '테스트 고객',
      phone: '010-1234-5678',
      roomNumber: '',
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      guests: 1,
      totalAmount: 0
    }
    
    setFoundReservation(testReservation)
    setStep('confirm')
  }


  const handleSearchWithParams = async (guestName: string, phone: string) => {
    // Supabase에서 검색 (이름+전화, 체크인/아웃 제외) → 폴백은 로컬
    let reservation: Reservation | null = null
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const idParam = urlParams.get('id') || undefined
      const nameParam = urlParams.get('campground') || undefined
      if ((idParam || nameParam || campgroundId || campgroundInfo?.name) && supabaseRest.isEnabled()) {
        let campId = idParam || campgroundId
        if (!campId) {
          const nameToUse = nameParam || campgroundInfo?.name
          if (nameToUse) {
            // 1) 정확히 일치
            const camps = await supabaseRest.select<any[]>('campgrounds', `?name=eq.${encodeURIComponent(nameToUse)}&select=id`)
            campId = camps && camps[0]?.id
            // 2) 없으면 ilike로 느슨검색
            if (!campId) {
              const like = await supabaseRest.select<any[]>('campgrounds', `?name=ilike.*${encodeURIComponent(nameToUse)}*&select=id`)
              campId = like && like[0]?.id
            }
            if (campId) setCampgroundId(campId)
          }
        }
        if (campId) {
          // 전화번호 유연 매칭: 숫자만/하이픈형 모두 시도
          const phoneDigits = phone.replace(/\D/g, '')
          const phoneHyphen = phoneDigits.length === 11
            ? `${phoneDigits.slice(0,3)}-${phoneDigits.slice(3,7)}-${phoneDigits.slice(7)}`
            : (phoneDigits.length === 10
              ? `${phoneDigits.slice(0,3)}-${phoneDigits.slice(3,6)}-${phoneDigits.slice(6)}`
              : phone)
          const orParam = encodeURIComponent(`phone.eq.${phoneDigits},phone.eq.${phoneHyphen}`)
          // 이름은 부분/대소문자 무시 매칭
          const encodedName = encodeURIComponent(`*${guestName}*`)
          const rows = await supabaseRest.select<any[]>(
            'reservations',
            `?campground_id=eq.${campId}&guest_name=ilike.${encodedName}&or=(${orParam})&status=in.(confirmed,checked-in)&order=check_in_date.desc&select=*`
          )
          const r = rows && rows[0]
          if (r) {
            reservation = {
              id: r.id,
              guestName: r.guest_name,
              phone: r.phone,
              roomNumber: r.room_number || '',
              checkInDate: r.check_in_date,
              checkOutDate: r.check_out_date,
              guests: r.guests || 1,
              totalAmount: r.total_amount || 0,
              status: r.status,
              createdAt: r.created_at,
              charcoalReservationTime: r.charcoal_reservation_time || undefined,
              actualCheckinTime: r.actual_checkin_time || undefined,
              actualCheckoutTime: r.actual_checkout_time || undefined
            }
          } else {
            // 최종 폴백: 이름만 ilike로 가져온 뒤 전화번호는 digits-only로 클라이언트 비교
            const broad = await supabaseRest.select<any[]>(
              'reservations',
              `?campground_id=eq.${campId}&guest_name=ilike.${encodedName}&order=check_in_date.desc&select=*`
            )
            const digitsOnly = (s: string) => String(s || '').replace(/\D/g, '')
            const candidates = (broad || []).filter(row => digitsOnly(row.phone) === phoneDigits)
            candidates.sort((a,b) => new Date(b.check_in_date).getTime() - new Date(a.check_in_date).getTime())
            const match = candidates.find(c => c.status !== 'checked-out') || candidates[0]
            if (match) {
              reservation = {
                id: match.id,
                guestName: match.guest_name,
                phone: match.phone,
                roomNumber: match.room_number || '',
                checkInDate: match.check_in_date,
                checkOutDate: match.check_out_date,
                guests: match.guests || 1,
                totalAmount: match.total_amount || 0,
                status: match.status,
                createdAt: match.created_at,
                charcoalReservationTime: match.charcoal_reservation_time || undefined,
                actualCheckinTime: match.actual_checkin_time || undefined,
                actualCheckoutTime: match.actual_checkout_time || undefined
              }
            }
          }
        }
      }
    } catch {}
    if (!reservation) {
      reservation = findReservation(guestName, phone)
    }

    if (!reservation) {
      setErrorMessage('예약 정보를 찾을 수 없습니다. 이름과 연락처를 다시 확인해주세요.')
      setStep('error')
      return
    }

    // 체크인 모드일 때
    if (mode === 'checkin') {
      if (reservation.status === 'checked-in') {
        setFoundReservation(reservation)
        setStep('already-done')
        return
      }

      if (reservation.status === 'checked-out') {
        setFoundReservation(reservation)
        setStep('already-done')
        return
      }
    }

    // 체크아웃 모드일 때
    if (mode === 'checkout') {
      if (reservation.status === 'confirmed') {
        setErrorMessage('아직 체크인하지 않은 예약입니다.')
        setStep('error')
        return
      }

      if (reservation.status === 'checked-out') {
        setFoundReservation(reservation)
        setStep('already-done')
        return
      }
    }

    // 체크인 날짜 확인 (체크인일 <= 오늘 <= 체크아웃일 인 경우 허용)
    const todayStr = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
    const toDate = (s: string) => new Date(`${s}T00:00:00`)
    const inRange = toDate(reservation.checkInDate) <= toDate(todayStr) && toDate(todayStr) <= toDate(reservation.checkOutDate)
    if (!inRange) {
      setErrorMessage(`체크인은 ${reservation.checkInDate} ~ ${reservation.checkOutDate} 기간에만 가능합니다.`)
      setStep('error')
      return
    }

    setFoundReservation(reservation)
    setStep('confirm')
  }

  const handleSearch = () => {
    if (!searchForm.guestName.trim() || !searchForm.phone.trim()) {
      setErrorMessage('이름과 연락처를 모두 입력해주세요.')
      return
    }

    handleSearchWithParams(searchForm.guestName.trim(), searchForm.phone.trim())
  }

  const handleCheckIn = async () => {
    if (!foundReservation) return

    try {
      // 예약 상태를 'checked-in'으로 업데이트 (Supabase 우선)
      const urlParams = new URLSearchParams(window.location.search)
      const name = urlParams.get('campground') || undefined
      let updated = false
      try {
        if (name && supabaseRest.isEnabled()) {
          const checkinTime = new Date().toISOString()
          setActualCheckinTime(checkinTime)
          await (supabaseRest as any).update('reservations', {
            status: 'checked-in',
            updated_at: checkinTime,
            actual_checkin_time: checkinTime
          }, `?id=eq.${foundReservation.id}`)
          updated = true
        }
      } catch {}
      if (!updated) {
        updateReservationStatus(foundReservation.id, 'checked-in')
      }
      // 이메일 알림 전송 (오도이촌 고정 주소로 사장님 알림)
      try {
        await fetch('/api/notify/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campgroundName: campgroundInfo?.name,
            guestName: foundReservation.guestName,
            phone: foundReservation.phone,
            roomNumber: foundReservation.roomNumber,
            checkInDate: foundReservation.checkInDate,
            checkOutDate: foundReservation.checkOutDate,
            guests: foundReservation.guests,
            amount: foundReservation.totalAmount,
            contactPhone: campgroundInfo?.contactPhone,
            contactEmail: campgroundInfo?.contactEmail
          })
        })
      } catch {}
      setStep('success')

      // Check if charcoal reservation is enabled
      if (charcoalEnabled && charcoalTimeOptions.length > 0) {
        setShowCharcoalSelection(true)  // Show charcoal selection UI
      } else {
        setShowSuccessModal(true)  // Show final success modal directly
      }
    } catch (error) {
      setErrorMessage('체크인 처리 중 오류가 발생했습니다. 관리자에게 문의해주세요.')
      setStep('error')
    }
  }

  const handleCharcoalSelection = async (time: string | null) => {
    // Save to Supabase if time is selected
    if (time && foundReservation) {
      try {
        if (supabaseRest.isEnabled()) {
          await supabaseRest.update('reservations', {
            charcoal_reservation_time: time
          }, `?id=eq.${foundReservation.id}`)
        }
        setSelectedCharcoalTime(time)
      } catch (error) {
        console.error('Failed to save charcoal time:', error)
        // Continue anyway - don't block user
      }
    } else {
      // Clear selected time when skipping
      setSelectedCharcoalTime(null)
    }

    setShowCharcoalSelection(false)
    setShowSuccessModal(true)  // Show final success modal
  }

  const handleCheckOut = async () => {
    if (!foundReservation) return

    try {
      // 예약 상태를 'checked-out'으로 업데이트 (Supabase 우선)
      const urlParams = new URLSearchParams(window.location.search)
      const name = urlParams.get('campground') || undefined
      let updated = false
      try {
        if (name && supabaseRest.isEnabled()) {
          const checkoutTime = new Date().toISOString()
          setActualCheckoutTime(checkoutTime)
          await (supabaseRest as any).update('reservations', {
            status: 'checked-out',
            updated_at: checkoutTime,
            actual_checkout_time: checkoutTime
          }, `?id=eq.${foundReservation.id}`)
          updated = true
        }
      } catch {}
      if (!updated) {
        updateReservationStatus(foundReservation.id, 'checked-out')
      }
      setStep('success')
      setShowSuccessModal(false)
    } catch (error) {
      setErrorMessage('체크아웃 처리 중 오류가 발생했습니다. 관리자에게 문의해주세요.')
      setStep('error')
    }
  }

  const resetForm = () => {
    setStep('search')
    setSearchForm({ guestName: '', phone: '' })
    setFoundReservation(null)
    setErrorMessage('')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 상태 체크: pending, suspended, terminated는 접근 불가
  if (campgroundStatus && ['pending', 'suspended', 'terminated'].includes(campgroundStatus)) {
    const statusMessages = {
      pending: '대기 중인 캠핑장입니다.',
      suspended: '일시정지된 캠핑장입니다.',
      terminated: '계약이 해지된 캠핑장입니다.'
    }
    return (
      <div className="kiosk-page">
        <div className="kiosk-container">
          <div className="kiosk-header">
            <span className="kiosk-logo-icon">🏕️</span>
            <h1>{campgroundInfo?.name || '캠핑장'}</h1>
            <span className="kiosk-subtitle">무인 체크인 키오스크</span>
          </div>

          <div className="kiosk-step-indicator">
            <div className="step active">1</div>
            <div className="step-divider"></div>
            <div className="step">2</div>
            <div className="step-divider"></div>
            <div className="step">3</div>
          </div>

          <div className="kiosk-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <div style={{ textAlign: 'center', padding: 40, maxWidth: 500 }}>
              <div style={{ fontSize: 80, marginBottom: 24 }}>❌</div>
              <h2 style={{ fontSize: 28, marginBottom: 16, color: '#ef4444', fontWeight: 700 }}>체크인 실패</h2>
              <p style={{ fontSize: 18, color: '#6b7280', lineHeight: 1.6, marginBottom: 32 }}>
                {statusMessages[campgroundStatus as keyof typeof statusMessages]}<br/>
                이용이 불가능합니다. 관리자에게 문의해주세요.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '16px 32px',
                  background: '#2E3D31',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 18,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                다시 시도
              </button>
            </div>
          </div>

          <div className="kiosk-footer">
            <p>문제가 있으신가요? 관리자에게 문의해주세요</p>
            <div className="contact-info">
              <span>📞 문의: {campgroundInfo?.contactPhone || '010-2592-3007'}</span>
              {campgroundInfo?.contactEmail && (
                <span>📧 이메일: {campgroundInfo.contactEmail}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="kiosk-page">
      <div className="kiosk-container">
        <div className="kiosk-header">
          <span className="kiosk-logo-icon">🏕️</span>
          <h1>{campgroundInfo?.name || '오도이촌 캠핑장'}</h1>
          <p>무인 체크인 키오스크</p>
        </div>

        <div className="kiosk-content">
          {step === 'search' && (
            <div className="search-step">
              <div className="step-indicator">
                <div className="step active">1</div>
                <div className="step-line"></div>
                <div className="step">2</div>
                <div className="step-line"></div>
                <div className="step">3</div>
              </div>

              <div className="form-container">
                {/* 체크인/체크아웃 모드 선택 */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24, justifyContent: 'center' }}>
                  <button
                    onClick={() => setMode('checkin')}
                    style={{
                      flex: 1,
                      padding: '16px 24px',
                      background: mode === 'checkin' ? '#2E3D31' : '#f3f4f6',
                      color: mode === 'checkin' ? '#fff' : '#6b7280',
                      border: mode === 'checkin' ? '2px solid #2E3D31' : '2px solid #e5e7eb',
                      borderRadius: 12,
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    📥 체크인
                  </button>
                  <button
                    onClick={() => setMode('checkout')}
                    style={{
                      flex: 1,
                      padding: '16px 24px',
                      background: mode === 'checkout' ? '#2E3D31' : '#f3f4f6',
                      color: mode === 'checkout' ? '#fff' : '#6b7280',
                      border: mode === 'checkout' ? '2px solid #2E3D31' : '2px solid #e5e7eb',
                      borderRadius: 12,
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    📤 체크아웃
                  </button>
                </div>

                <h3>{mode === 'checkin' ? '체크인 정보 입력' : '체크아웃 정보 입력'}</h3>
                <div className="form-group">
                  <label>예약자 이름</label>
                  <input
                    type="text"
                    value={searchForm.guestName}
                    onChange={(e) => setSearchForm({...searchForm, guestName: e.target.value})}
                    placeholder="예약자 이름을 입력하세요"
                  />
                </div>

                <div className="form-group">
                  <label>연락처</label>
                  <input
                    type="tel"
                    value={searchForm.phone}
                    onChange={(e) => setSearchForm({...searchForm, phone: e.target.value})}
                    placeholder="연락처를 입력하세요 (예: 010-1234-5678)"
                  />
                </div>

                <button onClick={handleSearch} className="checkin-btn">
                  {mode === 'checkin' ? '예약 확인' : '체크아웃 확인'}
                </button>
              </div>
            </div>
          )}

          {step === 'confirm' && foundReservation && (
            <div className="confirm-step">
              <div className="step-indicator">
                <div className="step">1</div>
                <div className="step-line active"></div>
                <div className="step active">2</div>
                <div className="step-line"></div>
                <div className="step">3</div>
              </div>

              <div className="form-container">
                <h3>{mode === 'checkin' ? '체크인 정보 확인' : '체크아웃 정보 확인'}</h3>
                <div className="confirm-info">
                  <div className="info-item">
                    <span className="label">예약자</span>
                    <span className="value">{foundReservation.guestName}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">연락처</span>
                    <span className="value">{foundReservation.phone}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">객실</span>
                    <span className="value">{foundReservation.roomNumber}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">체크인</span>
                    <span className="value">{formatDate(foundReservation.checkInDate)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">체크아웃</span>
                    <span className="value">{formatDate(foundReservation.checkOutDate)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">인원</span>
                    <span className="value">{foundReservation.guests}명</span>
                  </div>
                </div>

                <div className="confirm-actions">
                  <button onClick={resetForm} className="confirm-btn secondary">
                    다시 입력
                  </button>
                  <button
                    onClick={mode === 'checkin' ? handleCheckIn : handleCheckOut}
                    className="confirm-btn primary"
                  >
                    {mode === 'checkin' ? '체크인 완료' : '체크아웃 완료'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="result-step">
              <div className="step-indicator">
                <div className="step">1</div>
                <div className="step-line active"></div>
                <div className="step">2</div>
                <div className="step-line active"></div>
                <div className="step active">3</div>
              </div>

              <div className="form-container">
                <span className="result-icon">✅</span>
                <h3 className="result-title">{mode === 'checkin' ? '체크인 완료!' : '체크아웃 완료!'}</h3>
                <p className="result-message">
                  {mode === 'checkin' ? (
                    <>
                      체크인이 성공적으로 완료되었습니다.<br />
                      즐거운 캠핑 되세요!
                    </>
                  ) : (
                    <>
                      체크아웃이 성공적으로 완료되었습니다.<br />
                      이용해 주셔서 감사합니다!
                    </>
                  )}
                </p>
                {mode === 'checkin' && actualCheckinTime && (
                  <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    background: '#f0fdf4',
                    borderRadius: '8px',
                    border: '1px solid #86efac'
                  }}>
                    <div style={{ fontSize: '14px', color: '#166534', marginBottom: '4px' }}>실제 체크인 시간</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#15803d' }}>
                      {new Date(actualCheckinTime).toLocaleString('ko-KR', {
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}
                    </div>
                  </div>
                )}
                {mode === 'checkout' && actualCheckoutTime && (
                  <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    background: '#fef3c7',
                    borderRadius: '8px',
                    border: '1px solid #fbbf24'
                  }}>
                    <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '4px' }}>실제 체크아웃 시간</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#b45309' }}>
                      {new Date(actualCheckoutTime).toLocaleString('ko-KR', {
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}
                    </div>
                  </div>
                )}
                {/* 캠핑장 안내/사장님 메시지 */}
                {mode === 'checkin' && (
                  <button onClick={() => setShowSuccessModal(true)} className="result-btn primary" style={{ marginBottom: 12 }}>체크인 정보 보기</button>
                )}
                <div className="result-actions">
                  <button onClick={resetForm} className="result-btn secondary">
                    {mode === 'checkin' ? '새 체크인' : '새 체크아웃'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'already-done' && foundReservation && (
            <div className="result-step">
              <div className="step-indicator">
                <div className="step">1</div>
                <div className="step-line active"></div>
                <div className="step active">2</div>
                <div className="step-line"></div>
                <div className="step">3</div>
              </div>

              <div className="form-container">
                <span className="result-icon">ℹ️</span>
                <h3 className="result-title">
                  {mode === 'checkin'
                    ? (foundReservation.status === 'checked-in' ? '체크인 정보' : '이미 체크아웃 완료')
                    : '이미 체크아웃 완료'}
                </h3>
                <p className="result-message" style={{ marginBottom: 16 }}>
                  {mode === 'checkin' && foundReservation.status === 'checked-in' && '체크인 정보를 확인하세요.'}
                  {mode === 'checkin' && foundReservation.status === 'checked-out' && '이미 체크아웃을 완료하셨습니다.'}
                  {mode === 'checkout' && '이미 체크아웃을 완료하셨습니다.'}
                </p>

                {/* 체크인 완료 시 상세 정보 표시 */}
                {mode === 'checkin' && foundReservation.status === 'checked-in' && (
                  <div style={{ marginTop: 16 }}>
                    <div className="confirm-info" style={{ textAlign: 'left' }}>
                      <div className="info-item">
                        <span className="label">캠핑장</span>
                        <span className="value">{campgroundInfo?.name || '캠핑장'}</span>
                      </div>
                      {campgroundInfo?.description && (
                        <div className="info-item" style={{ display: 'block', borderBottom: 'none' }}>
                          <div className="label" style={{ marginBottom: 6 }}>사장님 안내말씀</div>
                          <div className="value" style={{ whiteSpace: 'pre-wrap' }}>{campgroundInfo.description}</div>
                        </div>
                      )}
                      <div className="info-item">
                        <span className="label">체크인/아웃</span>
                        <span className="value">{`${formatDate(foundReservation.checkInDate)} ~ ${formatDate(foundReservation.checkOutDate)}`}</span>
                      </div>
                      {campgroundInfo?.address && (
                        <div className="info-item">
                          <span className="label">주소</span>
                          <span className="value">{campgroundInfo.address}</span>
                        </div>
                      )}
                      <div className="info-item">
                        <span className="label">문의</span>
                        <span className="value">{campgroundInfo?.contactPhone || '-'} / {campgroundInfo?.contactEmail || '-'}</span>
                      </div>
                      {foundReservation.charcoalReservationTime && (
                        <div className="info-item" style={{ display: 'block', borderTop: '1px solid #e7e1d7', paddingTop: 12, marginTop: 12 }}>
                          <div className="label" style={{ marginBottom: 6 }}>🔥 숯불 예약 시간</div>
                          <div className="value" style={{ fontSize: 16, fontWeight: 600, color: '#ea580c' }}>{foundReservation.charcoalReservationTime}</div>
                        </div>
                      )}
                    </div>
                    <div className="result-message" style={{ textAlign: 'left', marginTop: 16 }}>
                      <strong>이용 안내</strong>
                      <ul style={{ marginTop: 8, paddingLeft: 18, lineHeight: 1.7 }}>
                        {(guidelines || '야간 소음 자제 부탁드립니다. 22시 이후 정숙.\n불꽃놀이는 지정된 공간에서만 가능합니다.\n분리수거는 출구 쪽 수거함을 이용해주세요.\n위급상황은 상단의 연락처로 바로 연락주세요.')
                          .split('\n').filter(Boolean).map((g, i) => (<li key={i}>{g}</li>))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* 체크아웃 완료 시 간단한 예약 정보만 표시 */}
                {(mode === 'checkout' || (mode === 'checkin' && foundReservation.status === 'checked-out')) && (
                  <div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>예약 정보</div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>예약자</span>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{foundReservation.guestName}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>객실</span>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{foundReservation.roomNumber}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 실제 체크인 시간 */}
                {foundReservation.actualCheckinTime && (
                  <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    background: '#f0fdf4',
                    borderRadius: '8px',
                    border: '1px solid #86efac'
                  }}>
                    <div style={{ fontSize: '14px', color: '#166534', marginBottom: '4px' }}>실제 체크인 시간</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#15803d' }}>
                      {new Date(foundReservation.actualCheckinTime).toLocaleString('ko-KR', {
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}
                    </div>
                  </div>
                )}

                {/* 실제 체크아웃 시간 */}
                {foundReservation.actualCheckoutTime && (
                  <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    background: '#fef3c7',
                    borderRadius: '8px',
                    border: '1px solid #fbbf24'
                  }}>
                    <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '4px' }}>실제 체크아웃 시간</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#b45309' }}>
                      {new Date(foundReservation.actualCheckoutTime).toLocaleString('ko-KR', {
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}
                    </div>
                  </div>
                )}

                <div className="result-actions" style={{ marginTop: '20px' }}>
                  <button onClick={resetForm} className="result-btn primary">
                    확인
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="result-step">
              <div className="step-indicator">
                <div className="step">1</div>
                <div className="step-line"></div>
                <div className="step">2</div>
                <div className="step-line"></div>
                <div className="step">3</div>
              </div>

              <div className="form-container">
                <span className="result-icon">❌</span>
                <h3 className="result-title">체크인 실패</h3>
                <p className="result-message">
                  {errorMessage}
                </p>
                <div className="result-actions">
                  <button onClick={resetForm} className="result-btn primary">
                    다시 시도
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Charcoal Reservation Time Selection */}
        {showCharcoalSelection && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}>
            <div style={{
              background: '#fffdf8',
              borderRadius: 12,
              width: 'min(92vw, 480px)',
              padding: 24,
              border: '1px solid #e7e1d7'
            }}>
              <h4 style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                color: '#2E3D31',
                marginBottom: 8
              }}>
                🔥 숯불 예약 시간 선택
              </h4>
              <p style={{
                fontSize: 14,
                color: '#6b7280',
                marginBottom: 20
              }}>
                원하시는 숯불 예약 시간대를 선택해주세요. (선택 사항)
              </p>

              <select
                value={selectedCharcoalTime || ''}
                onChange={(e) => setSelectedCharcoalTime(e.target.value || null)}
                style={{
                  width: '100%',
                  padding: 12,
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 16,
                  marginBottom: 20
                }}
              >
                <option value="">-- 시간대를 선택하세요 --</option>
                <option value="필요없음">숯불 예약 필요없음</option>
                {charcoalTimeOptions.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="result-btn secondary"
                  onClick={() => handleCharcoalSelection(null)}
                  style={{ flex: 1 }}
                >
                  건너뛰기
                </button>
                <button
                  className="result-btn primary"
                  onClick={() => {
                    if (selectedCharcoalTime === '필요없음') {
                      handleCharcoalSelection(null)
                    } else {
                      handleCharcoalSelection(selectedCharcoalTime)
                    }
                  }}
                  disabled={!selectedCharcoalTime}
                  style={{ flex: 1 }}
                >
                  선택 완료
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 체크인 완료 팝업 */}
        {step === 'success' && showSuccessModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} onClick={() => setShowSuccessModal(false)}>
            <div style={{ background: '#fffdf8', borderRadius: 12, width: 'min(92vw, 560px)', maxHeight: '90vh', overflowY: 'auto', padding: 24, border: '1px solid #e7e1d7' }} onClick={(e) => e.stopPropagation()}>
              <h4 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#2E3D31' }}>체크인 정보</h4>
              <div className="confirm-info" style={{ marginTop: 16 }}>
                <div className="info-item">
                  <span className="label">캠핑장</span>
                  <span className="value">{campgroundInfo?.name || '캠핑장'}</span>
                </div>
                {campgroundInfo?.description && (
                  <div className="info-item" style={{ display: 'block', borderBottom: 'none' }}>
                    <div className="label" style={{ marginBottom: 6 }}>사장님 안내말씀</div>
                    <div className="value" style={{ whiteSpace: 'pre-wrap' }}>{campgroundInfo.description}</div>
                  </div>
                )}
                <div className="info-item">
                  <span className="label">체크인/아웃</span>
                  <span className="value">{foundReservation ? `${formatDate(foundReservation.checkInDate)} ~ ${formatDate(foundReservation.checkOutDate)}` : '-'}</span>
                </div>
                {campgroundInfo?.address && (
                  <div className="info-item">
                    <span className="label">주소</span>
                    <span className="value">{campgroundInfo.address}</span>
                  </div>
                )}
                <div className="info-item">
                  <span className="label">문의</span>
                  <span className="value">{campgroundInfo?.contactPhone || '-'} / {campgroundInfo?.contactEmail || '-'}</span>
                </div>
                {/* Show selected charcoal time if any */}
                {selectedCharcoalTime && (
                  <div className="info-item" style={{ display: 'block', borderTop: '1px solid #e7e1d7', paddingTop: 12, marginTop: 12 }}>
                    <div className="label" style={{ marginBottom: 6 }}>🔥 숯불 예약 시간</div>
                    <div className="value" style={{ fontSize: 16, fontWeight: 600 }}>{selectedCharcoalTime}</div>
                  </div>
                )}
              </div>
              <div className="result-message" style={{ textAlign: 'left' }}>
                <strong>이용 안내</strong>
                <ul style={{ marginTop: 8, paddingLeft: 18, lineHeight: 1.7 }}>
                  {(guidelines || '야간 소음 자제 부탁드립니다. 22시 이후 정숙.\n불꽃놀이는 지정된 공간에서만 가능합니다.\n분리수거는 출구 쪽 수거함을 이용해주세요.\n위급상황은 상단의 연락처로 바로 연락주세요.')
                    .split('\n').filter(Boolean).map((g, i) => (<li key={i}>{g}</li>))}
                </ul>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                <button className="result-btn secondary" onClick={() => setShowSuccessModal(false)}>닫기</button>
                <button className="result-btn primary" onClick={() => { setShowSuccessModal(false); resetForm() }}>새 체크인</button>
              </div>
            </div>
          </div>
        )}

        <div className="kiosk-footer">
          <p>문제가 있으시면 관리자에게 문의해주세요</p>
          <p>📞 문의: {campgroundInfo?.contactPhone || '010-2592-3007'}</p>
          {campgroundInfo?.contactEmail && (
            <p>📧 이메일: {campgroundInfo.contactEmail}</p>
          )}
        </div>
      </div>
    </div>
  )
}