'use client'

import { useState } from 'react'

export default function OndamDemo() {
  const [step, setStep] = useState(0)
  const [showOverlay, setShowOverlay] = useState(true)
  const [messages, setMessages] = useState([
    { id: 1, text: "분리수거는 어떻게 해야 하나요?", time: "14:30", type: "customer" },
    { id: 2, text: "캠핑장 분리수거 안내: 일반쓰레기, 재활용품, 음식물쓰레기로 분리하여 각각 지정된 장소에 배출해주세요.", time: "14:31", type: "auto" },
    { id: 3, text: "화장실 위치가 어디인가요?", time: "15:15", type: "customer" },
    { id: 4, text: "화장실은 매장 옆 건물 2층에 위치해 있습니다. 24시간 이용 가능합니다.", time: "15:16", type: "auto" }
  ])
  
  const [newMessage, setNewMessage] = useState('')

  const sendMessage = () => {
    if (!newMessage.trim()) return
    
    const message = {
      id: messages.length + 1,
      text: newMessage,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      type: "customer" as const
    }
    
    setMessages([...messages, message])
    setNewMessage('')
    setStep(1) // 다음 단계로 진행
    
    // 자동 응답 시뮬레이션
    setTimeout(() => {
      const autoResponse = {
        id: messages.length + 2,
        text: "안녕하세요! 자주 묻는 질문에 대한 답변을 드립니다. 더 자세한 내용은 캠핑장 안내페이지를 참고해주세요.",
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        type: "auto" as const
      }
      setMessages(prev => [...prev, autoResponse])
      setStep(2) // 최종 단계로 진행
    }, 2000)
  }

  const overlayContent = [
    {
      title: "온담(문의함)이 뭔가요?",
      description: "고객이 캠핑장에서 궁금한 점을 문의하면 자동으로 답변해주는 시스템입니다.",
      benefits: [
        "24시간 자동 응답",
        "자주 묻는 질문 자동 답변",
        "사장님 부재 중에도 고객 응대",
        "문의 내역 자동 기록 및 관리"
      ]
    },
    {
      title: "자동응답이 어떻게 작동하나요?",
      description: "미리 설정한 답변으로 고객 문의에 즉시 응답합니다.",
      benefits: [
        "분리수거, 화장실 위치 등 자주 묻는 질문 자동 답변",
        "고객 만족도 향상",
        "사장님 업무 부담 감소",
        "응답 시간 단축"
      ]
    },
    {
      title: "문의 관리는 어떻게 되나요?",
      description: "모든 고객 문의가 자동으로 기록되고 관리됩니다.",
      benefits: [
        "문의 내역 실시간 확인",
        "답변 현황 추적",
        "고객 만족도 분석",
        "운영 개선점 도출"
      ]
    }
  ]

  const steps = [
    {
      title: "1단계: 사장님이 자동응답 설정",
      description: "사장님이 자주 묻는 질문에 대한 자동응답을 미리 설정합니다.",
      content: (
        <div className="owner-demo-content">
          <div className="view-indicator owner">사장님 화면</div>
          <h3>자동응답 설정</h3>
          <p className="step-description">고객들이 자주 묻는 질문에 대한 답변을 미리 설정합니다.</p>
          
          <div className="auto-response-settings">
            <h4>자동응답 설정</h4>
            <div className="setting-item">
              <label>분리수거 안내</label>
              <span className="status active">활성화</span>
            </div>
            <div className="setting-item">
              <label>화장실 위치 안내</label>
              <span className="status active">활성화</span>
            </div>
            <div className="setting-item">
              <label>매너타임 안내</label>
              <span className="status active">활성화</span>
            </div>
          </div>
          
          <div className="inquiry-list">
            <h4>기존 문의 내역</h4>
            {messages.slice(0, 2).map((message) => (
              <div key={message.id} className="inquiry-item">
                <div className="inquiry-header">
                  <strong>{message.type === 'customer' ? '고객 문의' : '자동 답변'}</strong>
                  <span>{message.time}</span>
                </div>
                <p>{message.text}</p>
              </div>
            ))}
          </div>
          
          <button 
            className="btn"
            onClick={() => setStep(1)}
          >
            고객 문의 시뮬레이션 →
          </button>
        </div>
      )
    },
    {
      title: "2단계: 고객이 문의 입력",
      description: "캠핑장에 있는 고객이 궁금한 점을 문의합니다.",
      content: (
        <div className="customer-demo-content">
          <div className="view-indicator customer">고객 화면</div>
          <h3>실시간 문의하기</h3>
          <p className="step-description">캠핑장에서 궁금한 점이 생겼습니다. 문의해보세요.</p>
          <input 
            type="text" 
            placeholder="궁금한 점을 입력해주세요..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button 
            className="btn"
            onClick={sendMessage}
            disabled={!newMessage.trim()}
          >
            문의 전송
          </button>
        </div>
      )
    },
    {
      title: "3단계: 자동 응답 및 완료",
      description: "문의가 전송되면 AI가 자동으로 답변을 생성하고 고객에게 전송됩니다.",
      content: (
        <div className="demo-success">
          <div className="success-icon">💬</div>
          <h3>문의 답변 완료!</h3>
          <div className="success-details">
            <p>✅ 자동 답변이 고객에게 전송되었습니다.</p>
            <p>📱 사장님 화면에 문의 내역이 기록되었습니다.</p>
            <p>🔄 필요시 추가 답변도 가능합니다.</p>
          </div>
          <button 
            className="btn btn-outline"
            onClick={() => {
              setStep(0)
              setNewMessage('')
            }}
          >
            처음부터 다시
          </button>
        </div>
      )
    }
  ]

  // 사장님 화면 콘텐츠
  const ownerView = (
    <div className="owner-dashboard">
      <h3>고객 문의 관리</h3>
      <div className="inquiry-list">
        {messages.map((message) => (
          <div key={message.id} className="inquiry-item">
            <div className="inquiry-header">
              <strong>{message.type === 'customer' ? '고객 문의' : '자동 답변'}</strong>
              <span>{message.time}</span>
            </div>
            <p>{message.text}</p>
            {message.type === 'customer' && (
              <button className="btn-small">답변하기</button>
            )}
          </div>
        ))}
      </div>
      <div className="auto-response-settings">
        <h4>자동응답 설정</h4>
        <div className="setting-item">
          <label>분리수거 안내</label>
          <span className="status active">활성화</span>
        </div>
        <div className="setting-item">
          <label>화장실 위치 안내</label>
          <span className="status active">활성화</span>
        </div>
        <div className="setting-item">
          <label>문자 알림</label>
          <span className="status active">활성화</span>
        </div>
      </div>
    </div>
  )

  return (
    <section className="demo-section">
        <div className="wrap">
          <h2>온담 (문의함)</h2>
          
          <div className="demo-card">
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