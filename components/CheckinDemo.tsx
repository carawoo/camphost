'use client'

import { useState } from 'react'

export default function CheckinDemo() {
  const [viewMode, setViewMode] = useState<'owner' | 'customer'>('owner')
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [reservations, setReservations] = useState([
    { id: 1, name: '김철수', phone: '010-1234-5678', site: 'A-15', date: '2025-01-25' },
    { id: 2, name: '이영희', phone: '010-9876-5432', site: 'B-03', date: '2025-01-25' },
  ])

  const steps = [
    {
      title: "고객이 이름·연락처 입력",
      content: (
        <div className="demo-form">
          <h3>체크인 정보 입력</h3>
          <input 
            type="text" 
            placeholder="이름을 입력하세요" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input 
            type="tel" 
            placeholder="연락처를 입력하세요" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button 
            className="btn"
            onClick={() => setStep(1)}
            disabled={!name || !phone}
          >
            체크인 신청
          </button>
        </div>
      )
    },
    {
      title: "예약 리스트 자동 매칭",
      content: (
        <div className="demo-result">
          <div className="checking">
            <div className="spinner"></div>
            <p>예약 정보 확인 중...</p>
            <small style={{ color: 'var(--sub)', marginTop: '8px', display: 'block' }}>
              사전 등록된 예약 리스트와 매칭합니다
            </small>
          </div>
          <button 
            className="btn"
            onClick={() => setStep(2)}
          >
            매칭 완료
          </button>
        </div>
      )
    },
    {
      title: "입실 완료",
      content: (
        <div className="demo-success">
          <div className="success-icon">✓</div>
          <h3>체크인 완료!</h3>
          <p><strong>{name}</strong>님, 안녕하세요!</p>
          <p>사이트: A-15 | 체크인: {new Date().toLocaleString()}</p>
          <button 
            className="btn btn-outline"
            onClick={() => {
              setStep(0)
              setName('')
              setPhone('')
            }}
          >
            다시 해보기
          </button>
        </div>
      )
    }
  ]

  // 사장님 화면 콘텐츠
  const ownerView = (
    <div className="owner-dashboard">
      <h3>예약 리스트 관리</h3>
      <div className="reservation-list">
        {reservations.map(res => (
          <div key={res.id} className="reservation-item">
            <div className="reservation-info">
              <strong>{res.name}</strong>
              <span>{res.phone}</span>
              <span>사이트: {res.site}</span>
              <span>{res.date}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="add-reservation">
        <h4>새 예약 추가</h4>
        <p className="helper-text">네이버/캠핏/땡큐캠핑에서 확인한 예약 정보를 입력하세요</p>
        <input type="text" placeholder="고객 이름" />
        <input type="tel" placeholder="연락처" />
        <input type="text" placeholder="사이트 번호" />
        <button className="btn">예약 추가</button>
      </div>
    </div>
  )

  return (
    <section className="demo-section">
      <div className="wrap">
        <h2>무인 체크인</h2>
        
        {/* 탭 네비게이션 */}
        <div className="demo-tabs">
          <button 
            className={`tab ${viewMode === 'owner' ? 'active' : ''}`}
            onClick={() => setViewMode('owner')}
          >
            사장님 화면
          </button>
          <button 
            className={`tab ${viewMode === 'customer' ? 'active' : ''}`}
            onClick={() => setViewMode('customer')}
          >
            고객 화면
          </button>
        </div>

        <div className="demo-card">
          {viewMode === 'owner' ? (
            ownerView
          ) : (
            <>
              <div className="demo-progress">
                {steps.map((_, index) => (
                  <div 
                    key={index} 
                    className={`step ${index <= step ? 'active' : ''}`}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
              <div className="demo-content">
                <h3>{steps[step].title}</h3>
                {steps[step].content}
              </div>
            </>
          )}
        </div>
        
        <div className="demo-features">
          <div className="feature">
            <span className="tick">✓</span>
            <span>사장님이 예약 플랫폼에서 확인한 예약을 시스템에 등록</span>
          </div>
          <div className="feature">
            <span className="tick">✓</span>
            <span>야간 입실/늦은 퇴실도 무리 없이 처리</span>
          </div>
          <div className="feature">
            <span className="tick">✓</span>
            <span>종이·전화·대기 제거</span>
          </div>
        </div>
      </div>
    </section>
  )
}
