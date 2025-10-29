'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import '../admin.css'

interface CheckInOut {
  id: string
  guestName: string
  phone: string
  roomNumber: string
  checkInTime: string
  checkOutTime?: string
  status: 'checked-in' | 'checked-out'
  totalAmount: number
  paymentStatus: 'paid' | 'pending' | 'refunded'
}

export default function CheckInOutManagement() {
  const [checkIns, setCheckIns] = useState<CheckInOut[]>([])
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [showCheckOutModal, setShowCheckOutModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [newCheckIn, setNewCheckIn] = useState({
    guestName: '',
    phone: '',
    roomNumber: '',
    totalAmount: 0
  })
  const [selectedCheckOut, setSelectedCheckOut] = useState<CheckInOut | null>(null)

  // 샘플 데이터 로드
  useEffect(() => {
    const sampleData: CheckInOut[] = [
      {
        id: '1',
        guestName: '김철수',
        phone: '010-1234-5678',
        roomNumber: 'A동-101',
        checkInTime: '2024-01-15T14:00:00',
        status: 'checked-in',
        totalAmount: 150000,
        paymentStatus: 'paid'
      },
      {
        id: '2',
        guestName: '이영희',
        phone: '010-9876-5432',
        roomNumber: 'B동-201',
        checkInTime: '2024-01-16T15:30:00',
        checkOutTime: '2024-01-18T11:00:00',
        status: 'checked-out',
        totalAmount: 120000,
        paymentStatus: 'paid'
      },
      {
        id: '3',
        guestName: '박민수',
        phone: '010-5555-1234',
        roomNumber: 'C동-301',
        checkInTime: '2024-01-17T16:00:00',
        status: 'checked-in',
        totalAmount: 200000,
        paymentStatus: 'pending'
      }
    ]
    setCheckIns(sampleData)
  }, [])

  const filteredCheckIns = checkIns.filter(checkIn => 
    filterStatus === 'all' || checkIn.status === filterStatus
  )

  const handleCheckIn = () => {
    if (!newCheckIn.guestName || !newCheckIn.phone || !newCheckIn.roomNumber) {
      alert('모든 필수 항목을 입력해주세요.')
      return
    }

    const checkIn: CheckInOut = {
      id: Date.now().toString(),
      ...newCheckIn,
      checkInTime: new Date().toISOString(),
      status: 'checked-in',
      paymentStatus: 'paid'
    }

    setCheckIns([...checkIns, checkIn])
    setNewCheckIn({
      guestName: '',
      phone: '',
      roomNumber: '',
      totalAmount: 0
    })
    setShowCheckInModal(false)
    alert('체크인이 완료되었습니다.')
  }

  const handleCheckOut = (checkIn: CheckInOut) => {
    setSelectedCheckOut(checkIn)
    setShowCheckOutModal(true)
  }

  const confirmCheckOut = () => {
    if (!selectedCheckOut) return

    setCheckIns(checkIns.map(item => 
      item.id === selectedCheckOut.id 
        ? { 
            ...item, 
            status: 'checked-out', 
            checkOutTime: new Date().toISOString() 
          }
        : item
    ))
    
    setShowCheckOutModal(false)
    setSelectedCheckOut(null)
    alert('체크아웃이 완료되었습니다.')
  }

  const getStatusColor = (status: CheckInOut['status']) => {
    switch (status) {
      case 'checked-in': return '#38a169'
      case 'checked-out': return '#718096'
      default: return '#718096'
    }
  }

  const getStatusText = (status: CheckInOut['status']) => {
    switch (status) {
      case 'checked-in': return '체크인 완료'
      case 'checked-out': return '체크아웃 완료'
      default: return status
    }
  }

  const getPaymentStatusColor = (status: CheckInOut['paymentStatus']) => {
    switch (status) {
      case 'paid': return '#38a169'
      case 'pending': return '#d69e2e'
      case 'refunded': return '#e53e3e'
      default: return '#718096'
    }
  }

  const getPaymentStatusText = (status: CheckInOut['paymentStatus']) => {
    switch (status) {
      case 'paid': return '결제완료'
      case 'pending': return '결제대기'
      case 'refunded': return '환불완료'
      default: return status
    }
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        {/* 헤더 */}
        <div className="dashboard-header">
          <div className="header-left">
            <Link href="/admin/dashboard" className="back-link">← 대시보드로</Link>
            <div className="logo">
              <span className="logo-icon">🚪</span>
              <h1>무인 체크인/체크아웃</h1>
            </div>
          </div>
          <div className="header-right">
            <button 
              onClick={() => setShowCheckInModal(true)}
              className="action-btn primary"
            >
              + 체크인 처리
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
                전체 ({checkIns.length})
              </button>
              <button 
                className={filterStatus === 'checked-in' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilterStatus('checked-in')}
              >
                체크인 ({checkIns.filter(c => c.status === 'checked-in').length})
              </button>
              <button 
                className={filterStatus === 'checked-out' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilterStatus('checked-out')}
              >
                체크아웃 ({checkIns.filter(c => c.status === 'checked-out').length})
              </button>
            </div>
          </div>

          {/* 체크인/체크아웃 목록 */}
          <div className="checkin-list">
            {filteredCheckIns.map(checkIn => (
              <div key={checkIn.id} className="checkin-card">
                <div className="checkin-header">
                  <div className="guest-info">
                    <h3>{checkIn.guestName}</h3>
                    <p>{checkIn.phone}</p>
                  </div>
                  <div className="status-badges">
                    <div className="status-badge" style={{ backgroundColor: getStatusColor(checkIn.status) }}>
                      {getStatusText(checkIn.status)}
                    </div>
                    <div className="status-badge" style={{ backgroundColor: getPaymentStatusColor(checkIn.paymentStatus) }}>
                      {getPaymentStatusText(checkIn.paymentStatus)}
                    </div>
                  </div>
                </div>
                
                <div className="checkin-details">
                  <div className="detail-item">
                    <span className="label">객실번호:</span>
                    <span>{checkIn.roomNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">체크인:</span>
                    <span>{formatDateTime(checkIn.checkInTime)}</span>
                  </div>
                  {checkIn.checkOutTime && (
                    <div className="detail-item">
                      <span className="label">체크아웃:</span>
                      <span>{formatDateTime(checkIn.checkOutTime)}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="label">금액:</span>
                    <span className="amount">{checkIn.totalAmount.toLocaleString()}원</span>
                  </div>
                </div>

                <div className="checkin-actions">
                  {checkIn.status === 'checked-in' && (
                    <button 
                      onClick={() => handleCheckOut(checkIn)}
                      className="action-btn secondary"
                    >
                      체크아웃 처리
                    </button>
                  )}
                  <button className="action-btn secondary">
                    상세보기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 체크인 모달 */}
        {showCheckInModal && (
          <div className="demo-modal-overlay" onClick={() => setShowCheckInModal(false)}>
            <div className="demo-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>무인 체크인</h3>
                <button className="close-btn" onClick={() => setShowCheckInModal(false)}>×</button>
              </div>
              <div className="modal-content">
                <p className="modal-description">
                  고객이 무인 체크인 키오스크를 통해 체크인을 완료했습니다.
                </p>
                <div className="form-group">
                  <label>고객명 *</label>
                  <input 
                    type="text" 
                    value={newCheckIn.guestName}
                    onChange={(e) => setNewCheckIn({ ...newCheckIn, guestName: e.target.value })}
                    placeholder="예) 김철수"
                  />
                </div>
                <div className="form-group">
                  <label>연락처 *</label>
                  <input 
                    type="tel" 
                    value={newCheckIn.phone}
                    onChange={(e) => setNewCheckIn({ ...newCheckIn, phone: e.target.value })}
                    placeholder="예) 010-1234-5678"
                  />
                </div>
                <div className="form-group">
                  <label>객실번호 *</label>
                  <input 
                    type="text" 
                    value={newCheckIn.roomNumber}
                    onChange={(e) => setNewCheckIn({ ...newCheckIn, roomNumber: e.target.value })}
                    placeholder="예) A동-101"
                  />
                </div>
                <div className="form-group">
                  <label>결제금액 (원)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={newCheckIn.totalAmount}
                    onChange={(e) => setNewCheckIn({ ...newCheckIn, totalAmount: parseInt(e.target.value) })}
                  />
                </div>
                <div className="modal-actions">
                  <button className="btn btn-outline" onClick={() => setShowCheckInModal(false)}>취소</button>
                  <button className="btn" onClick={handleCheckIn}>체크인 완료</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 체크아웃 모달 */}
        {showCheckOutModal && selectedCheckOut && (
          <div className="demo-modal-overlay" onClick={() => setShowCheckOutModal(false)}>
            <div className="demo-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>무인 체크아웃</h3>
                <button className="close-btn" onClick={() => setShowCheckOutModal(false)}>×</button>
              </div>
              <div className="modal-content">
                <p className="modal-description">
                  고객이 무인 체크아웃 키오스크를 통해 체크아웃을 완료했습니다.
                </p>
                <div className="checkout-info">
                  <div className="info-item">
                    <span className="label">고객명:</span>
                    <span>{selectedCheckOut.guestName}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">객실번호:</span>
                    <span>{selectedCheckOut.roomNumber}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">체크인 시간:</span>
                    <span>{formatDateTime(selectedCheckOut.checkInTime)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">결제금액:</span>
                    <span className="amount">{selectedCheckOut.totalAmount.toLocaleString()}원</span>
                  </div>
                </div>
                <div className="modal-actions">
                  <button className="btn btn-outline" onClick={() => setShowCheckOutModal(false)}>취소</button>
                  <button className="btn" onClick={confirmCheckOut}>체크아웃 완료</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
