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
  const [step, setStep] = useState<'search' | 'confirm' | 'success' | 'error'>('search')
  const [searchForm, setSearchForm] = useState({
    guestName: '',
    phone: ''
  })
  const [foundReservation, setFoundReservation] = useState<Reservation | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [campgroundInfo, setCampgroundInfo] = useState<CampgroundInfo | null>(null)

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
            setCampgroundInfo({
              id: row.id,
              name: row.name,
              contactPhone: row.contact_phone || '',
              contactEmail: row.contact_email || '',
              address: row.address || '',
              description: row.description || ''
            })
            return
          }
          // fallback below
          const target = campgroundService.getAll().find(c => c.name === name)
          if (target) {
            setCampgroundInfo({
              id: target.id,
              name: target.name,
              contactPhone: target.contactInfo?.phone || '',
              contactEmail: target.contactInfo?.email || '',
              address: target.address || '',
              description: target.description || ''
            })
          } else {
            setCampgroundInfo(getCampgroundInfo())
          }
        })()
        return
      }
      if (name) {
        const target = campgroundService.getAll().find(c => c.name === name)
        if (target) {
          const mapped: CampgroundInfo = {
            id: target.id,
            name: target.name,
            contactPhone: target.contactInfo?.phone || '',
            contactEmail: target.contactInfo?.email || '',
            address: target.address || '',
            description: target.description || ''
          }
          setCampgroundInfo(mapped)
          return
        }
      }
    } catch {}
    const info = getCampgroundInfo()
    setCampgroundInfo(info)
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
      const id = urlParams.get('id') || undefined
      const name = urlParams.get('campground') || undefined
      if ((id || name) && supabaseRest.isEnabled()) {
        // 캠핑장 ID 조회
        const camps = await supabaseRest.select<any[]>('campgrounds', id ? `?id=eq.${encodeURIComponent(id)}&select=id` : `?name=eq.${encodeURIComponent(name!)}&select=id`)
        const camp = camps && camps[0]
        if (camp?.id) {
          const rows = await supabaseRest.select<any[]>(
            'reservations',
            `?campground_id=eq.${camp.id}&guest_name=eq.${encodeURIComponent(guestName)}&phone=eq.${encodeURIComponent(phone)}&select=*`
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
              createdAt: r.created_at
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

    if (reservation.status === 'checked-in') {
      setErrorMessage('이미 체크인 완료된 예약입니다.')
      setStep('error')
      return
    }

    if (reservation.status === 'checked-out') {
      setErrorMessage('체크아웃 완료된 예약입니다.')
      setStep('error')
      return
    }

    // 체크인 날짜 확인 (테스트를 위해 임시로 비활성화)
    // const today = new Date().toISOString().split('T')[0]
    // if (reservation.checkInDate !== today) {
    //   setErrorMessage(`체크인 날짜가 아닙니다. 체크인 날짜: ${reservation.checkInDate}`)
    //   setStep('error')
    //   return
    // }

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
          await (supabaseRest as any).upsert('reservations', { id: foundReservation.id, status: 'checked-in' }, 'id')
          updated = true
        }
      } catch {}
      if (!updated) {
        updateReservationStatus(foundReservation.id, 'checked-in')
      }
      setStep('success')
    } catch (error) {
      setErrorMessage('체크인 처리 중 오류가 발생했습니다. 관리자에게 문의해주세요.')
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
                <h3>예약 정보 입력</h3>
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
                  예약 확인
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
                <h3>예약 정보 확인</h3>
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
                  <button onClick={handleCheckIn} className="confirm-btn primary">
                    체크인 완료
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
                <h3 className="result-title">체크인 완료!</h3>
                <p className="result-message">
                  체크인이 성공적으로 완료되었습니다.<br />
                  즐거운 캠핑 되세요!
                </p>
                <div className="result-actions">
                  <button onClick={resetForm} className="result-btn secondary">
                    새 체크인
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

        <div className="kiosk-footer">
          <p>문제가 있으시면 관리자에게 문의해주세요</p>
          <p>📞 문의: {campgroundInfo?.contactPhone || '010-1234-5678'}</p>
          <p>📧 이메일: {campgroundInfo?.contactEmail || 'carawoo96@gmail.com'}</p>
        </div>
      </div>
    </div>
  )
}