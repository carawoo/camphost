'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import '../admin.css'

interface Room {
  id: string
  name: string
  type: string
  capacity: number
  price: number
  amenities: string[]
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning'
  description: string
}

export default function RoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [campgroundName, setCampgroundName] = useState('')
  const [campgroundId, setCampgroundId] = useState('')
  const [newRoom, setNewRoom] = useState({
    name: '',
    type: 'A동',
    capacity: 4,
    price: 50000,
    amenities: [] as string[],
    description: ''
  })

  // URL params 로드
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setCampgroundName(params.get('campground') || '오도이촌')
    setCampgroundId(params.get('id') || '')
  }, [])

  // 샘플 데이터 로드
  useEffect(() => {
    const sampleRooms: Room[] = [
      {
        id: '1',
        name: 'A동-101',
        type: 'A동',
        capacity: 4,
        price: 50000,
        amenities: ['화장실', '샤워실', '주차장'],
        status: 'available',
        description: '넓은 공간의 가족형 객실'
      },
      {
        id: '2',
        name: 'A동-102',
        type: 'A동',
        capacity: 6,
        price: 70000,
        amenities: ['화장실', '샤워실', '주차장', '바베큐장'],
        status: 'occupied',
        description: '바베큐장이 있는 프리미엄 객실'
      },
      {
        id: '3',
        name: 'B동-201',
        type: 'B동',
        capacity: 2,
        price: 30000,
        amenities: ['화장실', '주차장'],
        status: 'cleaning',
        description: '커플을 위한 로맨틱 객실'
      },
      {
        id: '4',
        name: 'C동-301',
        type: 'C동',
        capacity: 8,
        price: 100000,
        amenities: ['화장실', '샤워실', '주차장', '바베큐장', '수영장'],
        status: 'maintenance',
        description: '대형 그룹을 위한 VIP 객실'
      }
    ]
    setRooms(sampleRooms)
  }, [])

  const filteredRooms = rooms.filter(room => 
    filterStatus === 'all' || room.status === filterStatus
  )

  const handleAddRoom = () => {
    if (!newRoom.name || !newRoom.type) {
      alert('객실명과 타입을 입력해주세요.')
      return
    }

    const room: Room = {
      id: Date.now().toString(),
      ...newRoom,
      status: 'available'
    }

    setRooms([...rooms, room])
    setNewRoom({
      name: '',
      type: 'A동',
      capacity: 4,
      price: 50000,
      amenities: [],
      description: ''
    })
    setShowAddModal(false)
    alert('객실이 등록되었습니다.')
  }

  const updateRoomStatus = (id: string, status: Room['status']) => {
    setRooms(rooms.map(room => 
      room.id === id ? { ...room, status } : room
    ))
  }

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = newRoom.amenities
    if (currentAmenities.includes(amenity)) {
      setNewRoom({
        ...newRoom,
        amenities: currentAmenities.filter(a => a !== amenity)
      })
    } else {
      setNewRoom({
        ...newRoom,
        amenities: [...currentAmenities, amenity]
      })
    }
  }

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'available': return '#38a169'
      case 'occupied': return '#e53e3e'
      case 'maintenance': return '#d69e2e'
      case 'cleaning': return '#3182ce'
      default: return '#718096'
    }
  }

  const getStatusText = (status: Room['status']) => {
    switch (status) {
      case 'available': return '이용가능'
      case 'occupied': return '사용중'
      case 'maintenance': return '점검중'
      case 'cleaning': return '청소중'
      default: return status
    }
  }

  const availableAmenities = ['화장실', '샤워실', '주차장', '바베큐장', '수영장', '에어컨', '난방', 'WiFi']

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        {/* 헤더 */}
        <div className="dashboard-header">
          <div className="header-left">
            <Link href={`/admin/dashboard?campground=${encodeURIComponent(campgroundName)}${campgroundId ? `&id=${campgroundId}` : ''}`} className="back-link">← 대시보드로</Link>
            <div className="logo">
              <span className="logo-icon">🏕️</span>
              <h1>객실 관리</h1>
            </div>
          </div>
          <div className="header-right">
            <button 
              onClick={() => setShowAddModal(true)}
              className="action-btn primary"
            >
              + 새 객실 등록
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
                전체 ({rooms.length})
              </button>
              <button 
                className={filterStatus === 'available' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilterStatus('available')}
              >
                이용가능 ({rooms.filter(r => r.status === 'available').length})
              </button>
              <button 
                className={filterStatus === 'occupied' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilterStatus('occupied')}
              >
                사용중 ({rooms.filter(r => r.status === 'occupied').length})
              </button>
              <button 
                className={filterStatus === 'maintenance' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilterStatus('maintenance')}
              >
                점검중 ({rooms.filter(r => r.status === 'maintenance').length})
              </button>
            </div>
          </div>

          {/* 객실 목록 */}
          <div className="room-grid">
            {filteredRooms.map(room => (
              <div key={room.id} className="room-card">
                <div className="room-header">
                  <div className="room-info">
                    <h3>{room.name}</h3>
                    <p>{room.type}</p>
                  </div>
                  <div className="status-badge" style={{ backgroundColor: getStatusColor(room.status) }}>
                    {getStatusText(room.status)}
                  </div>
                </div>
                
                <div className="room-details">
                  <div className="detail-item">
                    <span className="label">수용인원:</span>
                    <span>{room.capacity}명</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">1박 요금:</span>
                    <span className="amount">{room.price.toLocaleString()}원</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">설명:</span>
                    <span>{room.description}</span>
                  </div>
                </div>

                <div className="amenities">
                  <span className="label">편의시설:</span>
                  <div className="amenity-tags">
                    {room.amenities.map(amenity => (
                      <span key={amenity} className="amenity-tag">{amenity}</span>
                    ))}
                  </div>
                </div>

                <div className="room-actions">
                  {room.status === 'available' && (
                    <button 
                      onClick={() => updateRoomStatus(room.id, 'occupied')}
                      className="action-btn secondary"
                    >
                      사용중으로 변경
                    </button>
                  )}
                  {room.status === 'occupied' && (
                    <button 
                      onClick={() => updateRoomStatus(room.id, 'cleaning')}
                      className="action-btn secondary"
                    >
                      청소중으로 변경
                    </button>
                  )}
                  {room.status === 'cleaning' && (
                    <button 
                      onClick={() => updateRoomStatus(room.id, 'available')}
                      className="action-btn secondary"
                    >
                      이용가능으로 변경
                    </button>
                  )}
                  <button 
                    onClick={() => updateRoomStatus(room.id, 'maintenance')}
                    className="action-btn danger"
                  >
                    점검중으로 변경
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 새 객실 등록 모달 */}
        {showAddModal && (
          <div className="demo-modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="demo-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>새 객실 등록</h3>
                <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              <div className="modal-content">
                <div className="form-group">
                  <label>객실명 *</label>
                  <input 
                    type="text" 
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    placeholder="예) A동-103"
                  />
                </div>
                <div className="form-group">
                  <label>객실 타입 *</label>
                  <select 
                    value={newRoom.type}
                    onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                  >
                    <option value="A동">A동</option>
                    <option value="B동">B동</option>
                    <option value="C동">C동</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>수용인원</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="20"
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>1박 요금 (원)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={newRoom.price}
                    onChange={(e) => setNewRoom({ ...newRoom, price: parseInt(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>편의시설</label>
                  <div className="amenity-checkboxes">
                    {availableAmenities.map(amenity => (
                      <label key={amenity} className="checkbox-label">
                        <input 
                          type="checkbox"
                          checked={newRoom.amenities.includes(amenity)}
                          onChange={() => toggleAmenity(amenity)}
                        />
                        <span>{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>객실 설명</label>
                  <textarea 
                    value={newRoom.description}
                    onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                    placeholder="객실에 대한 설명을 입력하세요"
                    rows={3}
                  />
                </div>
                <div className="modal-actions">
                  <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>취소</button>
                  <button className="btn" onClick={handleAddRoom}>등록</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
