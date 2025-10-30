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
  charcoalReservationTime?: string
}
import { supabaseRest } from '@/services/supabaseRest'

export default function ReservationManagement() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCharcoal, setFilterCharcoal] = useState<boolean>(false)
  const [campgroundId, setCampgroundId] = useState<string>('')
  const [campgroundName, setCampgroundName] = useState<string>('')
  const [editing, setEditing] = useState<Reservation | null>(null)
  const [repeatCounts, setRepeatCounts] = useState<Record<string, number>>({})
  const [deleteMode, setDeleteMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
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
    setCampgroundName(name)
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
            actualCheckoutTime: r.actual_checkout_time,
            charcoalReservationTime: r.charcoal_reservation_time
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

  const filteredReservations = reservations.filter(reservation => {
    const statusMatch = filterStatus === 'all' || reservation.status === filterStatus
    const charcoalMatch = !filterCharcoal || Boolean(reservation.charcoalReservationTime)
    return statusMatch && charcoalMatch
  })

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
          updatedAt: r.updated_at,
          actualCheckinTime: r.actual_checkin_time,
          actualCheckoutTime: r.actual_checkout_time,
          charcoalReservationTime: r.charcoal_reservation_time
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
          updatedAt: r.updated_at,
          actualCheckinTime: r.actual_checkin_time,
          actualCheckoutTime: r.actual_checkout_time,
          charcoalReservationTime: r.charcoal_reservation_time
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
            actualCheckoutTime: r.actual_checkout_time,
            charcoalReservationTime: r.charcoal_reservation_time
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

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      alert('삭제할 예약을 선택해주세요.')
      return
    }

    const confirmed = window.confirm(
      `선택한 ${selectedIds.size}개의 예약을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
    )

    if (!confirmed) return

    try {
      if (!supabaseRest.isEnabled()) {
        alert('Supabase가 활성화되지 않았습니다.')
        return
      }

      console.log('[Bulk Delete] Starting deletion for IDs:', Array.from(selectedIds))

      // Supabase DELETE API 호출 (여러 개 삭제)
      const deletePromises = Array.from(selectedIds).map(async (id) => {
        console.log(`[Bulk Delete] Deleting reservation: ${id}`)
        try {
          const result = await supabaseRest.delete('reservations', `?id=eq.${id}`)
          console.log(`[Bulk Delete] Successfully deleted: ${id}`, result)
          return { id, success: true }
        } catch (err) {
          console.error(`[Bulk Delete] Failed to delete ${id}:`, err)
          return { id, success: false, error: err }
        }
      })

      const results = await Promise.all(deletePromises)

      const successCount = results.filter(r => r.success).length
      const failCount = results.filter(r => !r.success).length

      console.log(`[Bulk Delete] Results: ${successCount} success, ${failCount} failed`)

      if (failCount > 0) {
        const failedIds = results.filter(r => !r.success).map(r => r.id)
        console.error('[Bulk Delete] Failed IDs:', failedIds)
        alert(`${failCount}개의 예약 삭제에 실패했습니다.\n성공: ${successCount}개\n\n브라우저 콘솔을 확인해주세요.`)
      }

      // 성공한 항목만 State에서 제거
      const successIds = new Set(results.filter(r => r.success).map(r => r.id))
      setReservations(reservations.filter(r => !successIds.has(r.id)))

      // 삭제 모드 종료 및 선택 초기화
      setDeleteMode(false)
      setSelectedIds(new Set())

      if (successCount > 0) {
        alert(`${successCount}개의 예약이 삭제되었습니다.${failCount > 0 ? `\n${failCount}개 실패` : ''}`)
      }
    } catch (error) {
      console.error('[Bulk Delete] Unexpected error:', error)
      alert(`예약 삭제 중 오류가 발생했습니다.\n\n에러: ${error instanceof Error ? error.message : String(error)}`)
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
          updatedAt: r.updated_at,
          actualCheckinTime: r.actual_checkin_time,
          actualCheckoutTime: r.actual_checkout_time,
          charcoalReservationTime: r.charcoal_reservation_time
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
            <Link href={`/admin/dashboard?campground=${encodeURIComponent(campgroundName)}${campgroundId ? `&id=${campgroundId}` : ''}`} className="back-link">← 대시보드로</Link>
            <div className="logo">
              <span className="logo-icon">📋</span>
              <h1>체크인/체크아웃 관리</h1>
            </div>
          </div>
          <div className="header-right">
            {!deleteMode ? (
              <>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="action-btn primary"
                >
                  + 새 예약 등록
                </button>
                <button
                  onClick={() => setDeleteMode(true)}
                  className="action-btn danger"
                  style={{ marginLeft: 8 }}
                >
                  🗑️ 삭제 모드
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setDeleteMode(false)
                    setSelectedIds(new Set())
                  }}
                  className="action-btn secondary"
                >
                  취소
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="action-btn danger"
                  style={{ marginLeft: 8 }}
                  disabled={selectedIds.size === 0}
                >
                  선택 삭제 ({selectedIds.size})
                </button>
              </>
            )}
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
              <button
                className={filterCharcoal ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilterCharcoal(!filterCharcoal)}
              >
                🔥 숯불 예약 ({reservations.filter(r => r.charcoalReservationTime).length})
              </button>
            </div>
          </div>

          {/* 전체 선택 체크박스 (삭제 모드일 때만 표시) */}
          {deleteMode && (
            <div style={{
              padding: '12px 20px',
              background: '#fef3c7',
              border: '1px solid #fcd34d',
              borderRadius: 8,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <input
                type="checkbox"
                checked={selectedIds.size === filteredReservations.length && filteredReservations.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedIds(new Set(filteredReservations.map(r => r.id)))
                  } else {
                    setSelectedIds(new Set())
                  }
                }}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 14, fontWeight: 500, color: '#92400e' }}>
                전체 선택 ({selectedIds.size}/{filteredReservations.length})
              </span>
            </div>
          )}

          {/* 예약 목록 */}
          <div className="reservation-list">
            {filteredReservations.map(reservation => (
              <div
                key={reservation.id}
                className="reservation-card"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: deleteMode ? 12 : 0,
                  border: selectedIds.has(reservation.id) ? '2px solid #ef4444' : '1px solid #e5e7eb'
                }}
              >
                {deleteMode && (
                  <input
                    type="checkbox"
                    checked={selectedIds.has(reservation.id)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedIds)
                      if (e.target.checked) {
                        newSelected.add(reservation.id)
                      } else {
                        newSelected.delete(reservation.id)
                      }
                      setSelectedIds(newSelected)
                    }}
                    style={{
                      width: 20,
                      height: 20,
                      marginTop: 4,
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  />
                )}

                <div style={{ flex: 1 }}>
                  <div className="reservation-header">
                    <div className="guest-info">
                      <h3>
                        {reservation.guestName}
                        {reservation.charcoalReservationTime && (
                          <span style={{
                            marginLeft: 8,
                            fontSize: 18,
                            verticalAlign: 'middle'
                          }}>
                            🔥
                          </span>
                        )}
                      </h3>
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
                  {reservation.charcoalReservationTime && (
                    <div className="detail-item">
                      <span className="label">🔥 숯불 예약:</span>
                      <span className="value" style={{ fontWeight: 600, color: '#ea580c' }}>
                        {reservation.charcoalReservationTime}
                      </span>
                    </div>
                  )}
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
                    style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}
                  />
                </div>
                <div className="form-group">
                  <label>체크아웃 날짜 <span style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 400 }}>(선택, 미입력 시 체크인 다음날)</span></label>
                  <input
                    type="date"
                    value={newReservation.checkOutDate}
                    onChange={(e) => setNewReservation({ ...newReservation, checkOutDate: e.target.value })}
                    style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}
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
                  style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}
                />
              </div>
              <div className="form-group">
                <label>체크아웃 날짜 <span style={{ color: '#9ca3af', fontSize: '12px', fontWeight: 400 }}>(선택)</span></label>
                <input
                  type="date"
                  value={editing.checkOutDate}
                  onChange={(e) => setEditing({ ...(editing as Reservation), checkOutDate: e.target.value })}
                  style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}
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