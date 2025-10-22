'use client'

import { useState } from 'react'

export default function OndamDemo() {
  const [viewMode, setViewMode] = useState<'owner' | 'customer'>('owner')
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
    
    // 자동 응답 시뮬레이션
    setTimeout(() => {
      const autoResponse = {
        id: messages.length + 2,
        text: "안녕하세요! 자주 묻는 질문에 대한 답변을 드립니다. 더 자세한 내용은 캠핑장 안내페이지를 참고해주세요.",
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        type: "auto" as const
      }
      setMessages(prev => [...prev, autoResponse])
    }, 1000)
  }

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
            <div className="customer-chat">
              <div className="chat-header">
                <h3>실시간 상담</h3>
                <div className="status-indicator">
                  <span className="status-dot online"></span>
                  <span>캠지기 온라인</span>
                </div>
              </div>
              <div className="chat-container">
                <div className="chat-messages">
                  {messages.map((message) => (
                    <div key={message.id} className={`message ${message.type}`}>
                      <div className="message-content">
                        {message.text}
                      </div>
                      <div className="message-time">
                        {message.time}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="chat-input">
                  <input 
                    type="text" 
                    placeholder="문의사항을 입력하세요..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button className="btn" onClick={sendMessage}>
                    전송
                  </button>
                </div>
              </div>
              <div className="chat-notice">
                <p>💬 캠지기가 실시간으로 답변해드립니다. 궁금한 것이 있으면 언제든 문의하세요!</p>
              </div>
            </div>
          )}
        </div>
        
        {viewMode === 'owner' && (
          <div className="demo-features">
            <div className="feature">
              <span className="tick">✓</span>
              <span>사장님 부재 중에도 고객이 메시지 남김</span>
            </div>
            <div className="feature">
              <span className="tick">✓</span>
              <span>자주 묻는 질문 자동응답 / 문자 알림</span>
            </div>
            <div className="feature">
              <span className="tick">✓</span>
              <span>안내페이지(지도·매너타임·분리수거) 자동 제공</span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}