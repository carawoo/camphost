'use client'

import { useState, useEffect } from 'react'

export default function CheckinDemo() {
  const [step, setStep] = useState(0)
  const [demoName, setDemoName] = useState('')
  const [demoPhone, setDemoPhone] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [showOverlay, setShowOverlay] = useState(true)
  const [reservations, setReservations] = useState([
    { id: 1, name: '김철수', phone: '010-1234-5678', site: 'A-15', date: '2025-01-25' },
    { id: 2, name: '이영희', phone: '010-9876-5432', site: 'B-03', date: '2025-01-25' },
  ])




  const overlayContent = [
    {
      title: "무인 체크인이 뭔가요?",
      description: "고객이 직접 키오스크나 모바일로 체크인하는 시스템입니다.",
      benefits: [
        "사장님이 직접 대기할 필요 없음",
        "야간 입실도 자동 처리",
        "예약 정보와 자동 매칭",
        "이용 안내 문자 자동 전송"
      ]
    },
    {
      title: "예약 리스트 관리란?",
      description: "네이버/캠핏/땡큐캠핑 등에서 받은 예약을 시스템에 등록하는 과정입니다.",
      benefits: [
        "기존 예약 플랫폼 그대로 사용",
        "예약 정보를 한 곳에서 관리",
        "고객 체크인 시 자동 매칭",
        "실시간 체크인 현황 확인"
      ]
    },
    {
      title: "자동 매칭이 어떻게 되나요?",
      description: "고객이 이름과 연락처를 입력하면 등록된 예약과 자동으로 연결됩니다.",
      benefits: [
        "수동 확인 과정 생략",
        "실수 없는 정확한 매칭",
        "즉시 입실 처리",
        "안내 문자 자동 발송"
      ]
    }
  ]

  const handleAddReservation = () => {
    if (!demoName.trim() || !demoPhone.trim()) {
      alert('이름과 연락처를 입력해주세요.')
      return
    }
    
    const newReservation = {
      id: reservations.length + 1,
      name: demoName.trim(),
      phone: demoPhone.trim(),
      site: 'C-12',
      date: new Date().toISOString().split('T')[0]
    }
    
    setReservations(prev => [...prev, newReservation])
    setDemoName('')
    setDemoPhone('')
    setStep(1) // 다음 단계로 진행
  }

  const handleCustomerCheckin = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('이름과 연락처를 입력해주세요.')
      return
    }
    
    // 예약 리스트에서 매칭 확인
    const matchedReservation = reservations.find(res => 
      res.name === customerName.trim() && res.phone === customerPhone.trim()
    )
    
    if (matchedReservation) {
      setStep(2) // 매칭 성공, 다음 단계로
    } else {
      setStep(3) // 매칭 실패
    }
  }

  const steps = [
    {
      title: "1단계: 사장님이 예약 추가",
      description: "네이버/캠핏/땡큐캠핑에서 확인한 예약을 시스템에 등록합니다.",
      content: (
        <div className="owner-demo-content">
          <div className="view-indicator owner">사장님 화면</div>
          <h3>예약 리스트 관리</h3>
          <p className="step-description">새로운 예약을 추가해보세요.</p>
          
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
            <input
              type="text"
              placeholder="고객 이름"
              value={demoName}
              onChange={(e) => setDemoName(e.target.value)}
            />
            <input
              type="tel"
              placeholder="연락처"
              value={demoPhone}
              onChange={(e) => setDemoPhone(e.target.value)}
            />
            <button 
              className="btn"
              onClick={handleAddReservation}
              disabled={!demoName.trim() || !demoPhone.trim()}
            >
              예약 추가하기
            </button>
          </div>
        </div>
      )
    },
    {
      title: "2단계: 고객이 체크인",
      description: "캠핑장에 도착한 고객이 키오스크에서 이름과 연락처를 입력합니다.",
      content: (
        <div className="customer-demo-content">
          <div className="view-indicator customer">고객 화면</div>
          <h3>체크인 정보 입력</h3>
          <p className="step-description">캠핑장에 도착했습니다. 이름과 연락처를 입력해주세요.</p>
          <input 
            type="text" 
            placeholder="이름을 입력하세요" 
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <input 
            type="tel" 
            placeholder="연락처를 입력하세요" 
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
          <button 
            className="btn"
            onClick={handleCustomerCheckin}
            disabled={!customerName.trim() || !customerPhone.trim()}
          >
            체크인 신청
          </button>
        </div>
      )
    },
    {
      title: "3단계: 예약 매칭 및 완료",
      description: "입력된 정보가 예약 리스트와 매칭되어 입실이 완료됩니다.",
      content: (
        <div className="demo-success">
          <div className="success-icon">✓</div>
          <h3>체크인 완료!</h3>
          <p><strong>{customerName}</strong>님, 안녕하세요!</p>
          <p>사이트: C-12 | 체크인: {new Date().toLocaleString()}</p>
          <div className="success-details">
            <p>📱 이용 안내 문자가 전송되었습니다.</p>
            <p>🏕️ 사이트 위치와 이용 안내를 확인하세요.</p>
          </div>
          <button 
            className="btn btn-outline"
            onClick={() => {
              setStep(0)
              setCustomerName('')
              setCustomerPhone('')
              setDemoName('')
              setDemoPhone('')
            }}
          >
            처음부터 다시
          </button>
        </div>
      )
    },
    {
      title: "예약 정보 없음",
      description: "등록된 예약 정보가 없습니다. 사장님에게 문의하세요.",
      content: (
        <div className="demo-error">
          <div className="error-icon">⚠️</div>
          <h3>예약 정보를 찾을 수 없습니다</h3>
          <p>입력하신 정보와 일치하는 예약이 없습니다.</p>
          <div className="error-details">
            <p>📞 사장님에게 직접 연락하세요</p>
            <p>🏕️ 또는 예약 플랫폼에서 예약을 확인해주세요</p>
          </div>
          <button 
            className="btn btn-outline"
            onClick={() => {
              setStep(1)
              setCustomerName('')
              setCustomerPhone('')
            }}
          >
            다시 시도
          </button>
        </div>
      )
    }
  ]


  return (
    <section className="demo-section">
        <div className="wrap">
          <h2>무인 체크인</h2>
          
          <div className="demo-card">
            <div className="demo-progress">
              {steps.slice(0, 3).map((_, index) => (
                <div 
                  key={index} 
                  className={`step ${index <= step && step < 3 ? 'active' : ''}`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
            <div className="demo-content">
              <h3>{steps[step].title}</h3>
              <p className="step-explanation">{steps[step].description}</p>
              {steps[step].content}
            </div>
          </div>

        {/* 오버레이 설명 */}
        {showOverlay && (
          <div className="overlay-backdrop" onClick={() => setShowOverlay(false)}>
            <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
              <div className="overlay-header">
                <h3>{overlayContent[step].title}</h3>
                <button 
                  className="overlay-close"
                  onClick={() => setShowOverlay(false)}
                >
                  ×
                </button>
              </div>
              <div className="overlay-body">
                <p className="overlay-description">{overlayContent[step].description}</p>
                <div className="overlay-benefits">
                  <h4>이런 점이 좋아요:</h4>
                  <ul>
                    {overlayContent[step].benefits.map((benefit, index) => (
                      <li key={index}>
                        <span className="benefit-icon">✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="overlay-footer">
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowOverlay(false)}
                >
                  알겠습니다
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
