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
  actualCheckinTime?: string
  actualCheckoutTime?: string
}
import { supabaseRest } from '@/services/supabaseRest'

export default function ReservationManagement() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [campgroundId, setCampgroundId] = useState<string>('')
  const [editing, setEditing] = useState<Reservation | null>(null)
  const [repeatCounts, setRepeatCounts] = useState<Record<string, number>>({})
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
            updatedAt: r.updated_at,
            actualCheckinTime: r.actual_checkin_time,
            actualCheckoutTime: r.actual_checkout_time
          }))
          setReservations(mapped)
          // 재방문 집계 (동일 이름 + 동일 연락처)
          const toKey = (n: string, p: string) => `${n.trim()}|${String(p||'').replace(/\D/g,'')}`
          const counts: Record<string, number> = {}
          mapped.forEach(m => {
            const k = toKey(m.guestName, m.phone)
            counts[k] = (counts[k] || 0) + 1
          })
          setRepeatCounts(counts)
          return
        } catch {}
      }
      setReservations([])
      setRepeatCounts({})
    }
    loadReservations()
    // 폴링으로 외부(키오스크 등) 변경 반영
    const interval = setInterval(loadReservations, 5000)
    return () => clearInterval(interval)
  }, [campgroundId])

  const filteredReservations = reservations.filter(reservation => 
    filterStatus === 'all' || reservation.status === filterStatus
  )

  const handleAddReservation = async () => {
    if (!newReservation.guestName || !newReservation.phone || !newReservation.checkInDate) {
      alert('고객명, 연락처, 체크인 날짜는 필수입니다.')
      return
    }

    // 체크아웃 날짜가 없으면 체크인 다음날로 자동 설정
    const checkOutDate = newReservation.checkOutDate ||
      new Date(new Date(newReservation.checkInDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    try {
      if (supabaseRest.isEnabled() && campgroundId) {
        await supabaseRest.insert('reservations', {
          campground_id: campgroundId,
          guest_name: newReservation.guestName,
          phone: newReservation.phone,
          room_number: newReservation.roomNumber || null,
          check_in_date: newReservation.checkInDate,
          check_out_date: checkOutDate,
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
        const toKey = (n: string, p: string) => `${n.trim()}|${String(p||'').replace(/\D/g,'')}`
        const counts: Record<string, number> = {}
        mapped.forEach(m => { const k = toKey(m.guestName, m.phone); counts[k] = (counts[k] || 0) + 1 })
        setRepeatCounts(counts)
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
        const toKey = (n: string, p: string) => `${n.trim()}|${String(p||'').replace(/\D/g,'')}`
        const counts: Record<string, number> = {}
        mapped.forEach(m => { const k = toKey(m.guestName, m.phone); counts[k] = (counts[k] || 0) + 1 })
        setRepeatCounts(counts)
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
            updatedAt: r.updated_at,
            actualCheckinTime: r.actual_checkin_time,
            actualCheckoutTime: r.actual_checkout_time
          }))
          setReservations(mapped)
          const toKey = (n: string, p: string) => `${n.trim()}|${String(p||'').replace(/\D/g,'')}`
          const counts: Record<string, number> = {}
          mapped.forEach(m => { const k = toKey(m.guestName, m.phone); counts[k] = (counts[k] || 0) + 1 })
          setRepeatCounts(counts)
        }
      } catch (error) {
        alert('예약 삭제 중 오류가 발생했습니다.')
      }
    }
  }

  const openEdit = (res: Reservation) => {
    setEditing(res)
    setShowEditModal(true)
  }

  const handleUpdateReservationFields = async () => {
    if (!editing) return

    // 체크아웃 날짜가 없으면 체크인 다음날로 자동 설정
    const checkOutDate = editing.checkOutDate ||
      new Date(new Date(editing.checkInDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    try {
      if (supabaseRest.isEnabled()) {
        await supabaseRest.update('reservations', {
          guest_name: editing.guestName,
          phone: editing.phone,
          room_number: editing.roomNumber || null,
          check_in_date: editing.checkInDate,
          check_out_date: checkOutDate,
          guests: editing.guests,
          total_amount: editing.totalAmount
        }, `?id=eq.${editing.id}`)
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
      setShowEditModal(false)
      setEditing(null)
      alert('예약 정보가 수정되었습니다.')
    } catch (e) {
      alert('수정 중 오류가 발생했습니다.')
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
              <h1>체크인/체크아웃 관리</h1>
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
                  <div className="detail-item">
                    <span className="label">재방문:</span>
                    <span>
                      {Math.max(0, (repeatCounts[`${reservation.guestName.trim()}|${String(reservation.phone||'').replace(/\D/g,'')}`] || 1) - 1)}회
                    </span>
                  </div>
                  {reservation.actualCheckinTime && (
                    <div className="detail-item">
                      <span className="label">실제 체크인:</span>
                      <span>{new Date(reservation.actualCheckinTime).toLocaleString('ko-KR', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}</span>
                    </div>
                  )}
                  {reservation.actualCheckoutTime && (
                    <div className="detail-item">
                      <span className="label">실제 체크아웃:</span>
                      <span>{new Date(reservation.actualCheckoutTime).toLocaleString('ko-KR', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}</span>
                    </div>
                  )}
                </div>

                <div className="reservation-actions">
                  {reservation.status === 'confirmed' && (
                    <button 
                      onClick={() => handleUpdateStatus(reservation.id, 'checked-in')}
                      className="action-btn secondary"
                    >
                      체크인 처리
                    </button>
                  )}
                  {reservation.status === 'confirmed' && (
                    <button 
                      onClick={() => openEdit(reservation)}
                      className="action-btn secondary"
                    >
                      정보 수정
                    </button>
                  )}
                  {reservation.status === 'confirmed' && (
                    <button 
                      onClick={() => handleDeleteReservation(reservation.id)}
                      className="action-btn danger"
                    >
                      삭제
                    </button>
                  )}
                  {reservation.status === 'checked-in' && (
                    <button 
                      onClick={() => handleUpdateStatus(reservation.id, 'checked-out')}
                      className="action-btn secondary"
                    >
                      체크아웃 처리
                    </button>
                  )}
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
                  <label>객실번호 <span style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 400 }}>(선택)</span></label>
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
                  <label>체크아웃 날짜 <span style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 400 }}>(선택, 미입력 시 체크인 다음날)</span></label>
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
                  <label>총 금액 (원) <span style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 400 }}>(선택)</span></label>
                  <input
                    type="number"
                    min="0"
                    value={newReservation.totalAmount}
                    onChange={(e) => setNewReservation({ ...newReservation, totalAmount: parseInt(e.target.value) })}
                    placeholder="0"
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

      {/* 예약 수정 모달 */}
      {showEditModal && editing && (
        <div className="demo-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="demo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>예약 정보 수정</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>고객명 *</label>
                <input 
                  type="text" 
                  value={editing.guestName}
                  onChange={(e) => setEditing({ ...(editing as Reservation), guestName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>연락처 *</label>
                <input 
                  type="tel" 
                  value={editing.phone}
                  onChange={(e) => setEditing({ ...(editing as Reservation), phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>객실번호 <span style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 400 }}>(선택)</span></label>
                <input
                  type="text"
                  value={editing.roomNumber || ''}
                  onChange={(e) => setEditing({ ...(editing as Reservation), roomNumber: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>체크인 날짜 *</label>
                <input 
                  type="date" 
                  value={editing.checkInDate}
                  onChange={(e) => setEditing({ ...(editing as Reservation), checkInDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>체크아웃 날짜 <span style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 400 }}>(선택)</span></label>
                <input
                  type="date"
                  value={editing.checkOutDate}
                  onChange={(e) => setEditing({ ...(editing as Reservation), checkOutDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>인원 수</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10"
                  value={editing.guests}
                  onChange={(e) => setEditing({ ...(editing as Reservation), guests: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="form-group">
                <label>총 금액 (원) <span style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 400 }}>(선택)</span></label>
                <input
                  type="number"
                  min="0"
                  value={editing.totalAmount}
                  onChange={(e) => setEditing({ ...(editing as Reservation), totalAmount: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="modal-actions">
                <button className="btn btn-outline" onClick={() => setShowEditModal(false)}>취소</button>
                <button className="btn" onClick={handleUpdateReservationFields}>저장</button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}