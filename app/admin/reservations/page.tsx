'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import '../admin.css'
// Supabase 전용으로 전환 – 로컬 목업 의존성 제거
type Reservation = {
  id: string
  guestName: string
  phone: string
  roomNumber?: string
  checkInDate: string
  checkOutDate: string
  guests: number
  totalAmount: number
  status: 'confirmed' | 'checked-in' | 'checked-out'
  createdAt: string
  updatedAt: string
}
import { supabaseRest } from '@/services/supabaseRest'

export default function ReservationManagement() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [campgroundId, setCampgroundId] = useState<string>('')
  const [newReservation, setNewReservation] = useState({
    guestName: '',
    phone: '',
    roomNumber: '',
    checkInDate: '',
    checkOutDate: '',
    guests: 2,
    totalAmount: 0
  })

  // 캠핑장 ID 로드 후 예약 로드
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const name = params.get('campground') || '오도이촌'
    ;(async () => {
      try {
        if (supabaseRest.isEnabled()) {
          const rows = await supabaseRest.select<any[]>('campgrounds', `?name=eq.${encodeURIComponent(name)}&select=id`)
          const row = rows && rows[0]
          if (row?.id) setCampgroundId(row.id)
        }
      } catch {}
    })()
  }, [])

  useEffect(() => {
    const loadReservations = async () => {
      if (supabaseRest.isEnabled() && campgroundId) {
        try {
          const rows = await supabaseRest.select<any[]>(
            'reservations',
            `?campground_id=eq.${campgroundId}&select=*&order=updated_at.desc`
          )
          const mapped: Reservation[] = (rows || []).map(r => ({
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
            updatedAt: r.updated_at
          }))
          setReservations(mapped)
          return
        } catch {}
      }
      setReservations([])
    }
    loadReservations()
  }, [campgroundId])

  const filteredReservations = reservations.filter(reservation => 
    filterStatus === 'all' || reservation.status === filterStatus
  )

  const handleAddReservation = async () => {
    if (!newReservation.guestName || !newReservation.phone || !newReservation.checkInDate || !newReservation.checkOutDate) {
      alert('모든 필수 항목을 입력해주세요.')
      return
    }

    try {
      if (supabaseRest.isEnabled() && campgroundId) {
        await supabaseRest.insert('reservations', {
          campground_id: campgroundId,
          guest_name: newReservation.guestName,
          phone: newReservation.phone,
          room_number: newReservation.roomNumber || null,
          check_in_date: newReservation.checkInDate,
          check_out_date: newReservation.checkOutDate,
          guests: newReservation.guests,
          total_amount: newReservation.totalAmount,
          status: 'confirmed'
        })
        // reload
        const rows = await supabaseRest.select<any[]>('reservations', `?campground_id=eq.${campgroundId}&select=*&order=updated_at.desc`)
        const mapped: Reservation[] = (rows || []).map(r => ({
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
          updatedAt: r.updated_at
        }))
        setReservations(mapped)
      }
      
      setNewReservation({
        guestName: '',
        phone: '',
        roomNumber: '',
        checkInDate: '',
        checkOutDate: '',
        guests: 2,
        totalAmount: 0
      })
      setShowAddModal(false)
      alert('예약이 성공적으로 등록되었습니다!')
    } catch (error) {
      alert('예약 등록 중 오류가 발생했습니다.')
    }
  }

  const handleUpdateStatus = async (id: string, status: Reservation['status']) => {
    try {
      if (supabaseRest.isEnabled()) {
        await supabaseRest.update('reservations', { status }, `?id=eq.${id}`)
        const rows = await supabaseRest.select<any[]>('reservations', `?campground_id=eq.${campgroundId}&select=*&order=updated_at.desc`)
        const mapped: Reservation[] = (rows || []).map(r => ({
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
          updatedAt: r.updated_at
        }))
        setReservations(mapped)
      }
    } catch (error) {
      alert('상태 업데이트 중 오류가 발생했습니다.')
    }
  }

  const handleDeleteReservation = async (id: string) => {
    if (confirm('정말로 이 예약을 삭제하시겠습니까?')) {
      try {
        if (supabaseRest.isEnabled()) {
          await supabaseRest.delete('reservations', `?id=eq.${id}`)
          const rows = await supabaseRest.select<any[]>('reservations', `?campground_id=eq.${campgroundId}&select=*&order=updated_at.desc`)
          const mapped: Reservation[] = (rows || []).map(r => ({
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
            updatedAt: r.updated_at
          }))
          setReservations(mapped)
        }
      } catch (error) {
        alert('예약 삭제 중 오류가 발생했습니다.')
      }
    }
  }

  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed': return '#3182ce'
      case 'checked-in': return '#38a169'
      case 'checked-out': return '#718096'
      default: return '#718096'
    }
  }

  const getStatusText = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed': return '확정'
      case 'checked-in': return '체크인'
      case 'checked-out': return '체크아웃'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        {/* 헤더 */}
        <div className="dashboard-header">
          <div className="header-left">
            <Link href="/admin/dashboard" className="back-link">← 대시보드로</Link>
            <div className="logo">
              <span className="logo-icon">📋</span>
              <h1>예약 관리</h1>
            </div>
          </div>
          <div className="header-right">
            <button 
              onClick={() => setShowAddModal(true)}
              className="action-btn primary"
            >
              + 새 예약 등록
            </button>
          </div>
        </div>

        {/* 필터 및 통계 */}
        <div className="management-section">
          <div className="filter-section">
            <div className="filter-buttons">
              <button 
                className={filterStatus === 'all' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilterStatus('all')}
              >
                전체 ({reservations.length})
              </button>
              <button 
                className={filterStatus === 'confirmed' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilterStatus('confirmed')}
              >
                확정 ({reservations.filter(r => r.status === 'confirmed').length})
              </button>
              <button 
                className={filterStatus === 'checked-in' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilterStatus('checked-in')}
              >
                체크인 ({reservations.filter(r => r.status === 'checked-in').length})
              </button>
              <button 
                className={filterStatus === 'checked-out' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilterStatus('checked-out')}
              >
                체크아웃 ({reservations.filter(r => r.status === 'checked-out').length})
              </button>
            </div>
          </div>

          {/* 예약 목록 */}
          <div className="reservation-list">
            {filteredReservations.map(reservation => (
              <div key={reservation.id} className="reservation-card">
                <div className="reservation-header">
                  <div className="guest-info">
                    <h3>{reservation.guestName}</h3>
                    <p>{reservation.phone}</p>
                  </div>
                  <div className="status-badge" style={{ backgroundColor: getStatusColor(reservation.status) }}>
                    {getStatusText(reservation.status)}
                  </div>
                </div>
                
                <div className="reservation-details">
                  <div className="detail-item">
                    <span className="label">객실:</span>
                    <span>{reservation.roomNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">체크인:</span>
                    <span>{formatDate(reservation.checkInDate)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">체크아웃:</span>
                    <span>{formatDate(reservation.checkOutDate)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">인원:</span>
                    <span>{reservation.guests}명</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">금액:</span>
                    <span className="amount">{reservation.totalAmount.toLocaleString()}원</span>
                  </div>
                </div>

                <div className="reservation-actions">
                  {reservation.status === 'confirmed' && (
                    <button 
                      onClick={() => updateReservationStatus(reservation.id, 'checked-in')}
                      className="action-btn secondary"
                    >
                      체크인 처리
                    </button>
                  )}
                  {reservation.status === 'checked-in' && (
                    <button 
                      onClick={() => updateReservationStatus(reservation.id, 'checked-out')}
                      className="action-btn secondary"
                    >
                      체크아웃 처리
                    </button>
                  )}
                  <Link 
                    href={`/kiosk?guestName=${encodeURIComponent(reservation.guestName)}&phone=${encodeURIComponent(reservation.phone)}`}
                    className="action-btn secondary"
                    target="_blank"
                  >
                    키오스크 체크인
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 새 예약 등록 모달 */}
        {showAddModal && (
          <div className="demo-modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="demo-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>새 예약 등록</h3>
                <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              <div className="modal-content">
                <div className="form-group">
                  <label>고객명 *</label>
                  <input 
                    type="text" 
                    value={newReservation.guestName}
                    onChange={(e) => setNewReservation({ ...newReservation, guestName: e.target.value })}
                    placeholder="예) 김철수"
                  />
                </div>
                <div className="form-group">
                  <label>연락처 *</label>
                  <input 
                    type="tel" 
                    value={newReservation.phone}
                    onChange={(e) => setNewReservation({ ...newReservation, phone: e.target.value })}
                    placeholder="예) 010-1234-5678"
                  />
                </div>
                <div className="form-group">
                  <label>객실번호</label>
                  <input 
                    type="text" 
                    value={newReservation.roomNumber}
                    onChange={(e) => setNewReservation({ ...newReservation, roomNumber: e.target.value })}
                    placeholder="예) A동-101"
                  />
                </div>
                <div className="form-group">
                  <label>체크인 날짜 *</label>
                  <input 
                    type="date" 
                    value={newReservation.checkInDate}
                    onChange={(e) => setNewReservation({ ...newReservation, checkInDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>체크아웃 날짜 *</label>
                  <input 
                    type="date" 
                    value={newReservation.checkOutDate}
                    onChange={(e) => setNewReservation({ ...newReservation, checkOutDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>인원 수</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    value={newReservation.guests}
                    onChange={(e) => setNewReservation({ ...newReservation, guests: parseInt(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>총 금액 (원)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={newReservation.totalAmount}
                    onChange={(e) => setNewReservation({ ...newReservation, totalAmount: parseInt(e.target.value) })}
                  />
                </div>
                <div className="modal-actions">
                  <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>취소</button>
                  <button className="btn" onClick={handleAddReservation}>등록</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}