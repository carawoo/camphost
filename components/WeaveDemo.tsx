'use client'

import { useState } from 'react'

export default function WeaveDemo() {
  const [viewMode, setViewMode] = useState<'owner' | 'customer'>('customer')
  const [selectedMonth, setSelectedMonth] = useState('2024-12')
  
  const reportData = {
    '2024-12': {
      revenue: '2,450,000',
      occupancy: '78%',
      newCustomers: 45,
      repeatCustomers: 23,
      topIssue: '분리수거 문의 (35%)',
      weatherImpact: '맑음 15일, 흐림 10일, 비 6일',
      recommendation: '분리수거 안내 강화 필요'
    },
    '2024-11': {
      revenue: '2,120,000',
      occupancy: '65%',
      newCustomers: 38,
      repeatCustomers: 31,
      topIssue: '화장실 위치 문의 (42%)',
      weatherImpact: '맑음 18일, 흐림 8일, 비 4일',
      recommendation: '화장실 안내 표지판 추가'
    }
  }

  const currentData = reportData[selectedMonth as keyof typeof reportData]

  // 고객 화면 콘텐츠 - 비공개 문의 작성
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    phone: '',
    category: '',
    message: ''
  })

  const handleSubmit = () => {
    alert('비공개 문의가 전송되었습니다. 캠지기가 직접 답변드릴 예정입니다.')
    setInquiryForm({ name: '', phone: '', category: '', message: '' })
  }

  const customerView = (
    <div className="inquiry-form">
      <div className="form-header">
        <h3>비공개 문의</h3>
        <p>개인적인 문의나 민원사항을 안전하게 전달하세요</p>
      </div>
      
      <div className="form-content">
        <div className="form-group">
          <label>이름</label>
          <input 
            type="text" 
            value={inquiryForm.name}
            onChange={(e) => setInquiryForm({...inquiryForm, name: e.target.value})}
            placeholder="이름을 입력하세요"
          />
        </div>
        
        <div className="form-group">
          <label>연락처</label>
          <input 
            type="tel" 
            value={inquiryForm.phone}
            onChange={(e) => setInquiryForm({...inquiryForm, phone: e.target.value})}
            placeholder="연락처를 입력하세요"
          />
        </div>
        
        <div className="form-group">
          <label>문의 유형</label>
          <select 
            value={inquiryForm.category}
            onChange={(e) => setInquiryForm({...inquiryForm, category: e.target.value})}
          >
            <option value="">선택하세요</option>
            <option value="complaint">불만사항</option>
            <option value="suggestion">개선 제안</option>
            <option value="inquiry">일반 문의</option>
            <option value="other">기타</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>내용</label>
          <textarea 
            value={inquiryForm.message}
            onChange={(e) => setInquiryForm({...inquiryForm, message: e.target.value})}
            placeholder="문의 내용을 자세히 적어주세요"
            rows={5}
          />
        </div>
        
        <div className="privacy-notice">
          <p>🔒 <strong>개인정보 보호</strong></p>
          <p>• 본 문의는 캠지기에게만 전달됩니다</p>
          <p>• 개인정보는 문의 처리 후 즉시 삭제됩니다</p>
          <p>• 익명으로 처리 가능합니다</p>
        </div>
        
        <button 
          className="btn"
          onClick={handleSubmit}
          disabled={!inquiryForm.name || !inquiryForm.message}
        >
          비공개 문의 전송
        </button>
      </div>
    </div>
  )

  return (
    <section className="demo-section">
      <div className="wrap">
        <h2>위브 (리포트)</h2>
        
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
          {viewMode === 'customer' ? (
            customerView
          ) : (
            <>
          <div className="report-header">
            <h3>월간 운영 리포트</h3>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="month-selector"
            >
              <option value="2024-12">2024년 12월</option>
              <option value="2024-11">2024년 11월</option>
            </select>
          </div>
          
          <div className="report-grid">
            <div className="metric">
              <div className="metric-value">{currentData.revenue}원</div>
              <div className="metric-label">총 매출</div>
            </div>
            <div className="metric">
              <div className="metric-value">{currentData.occupancy}</div>
              <div className="metric-label">가동률</div>
            </div>
            <div className="metric">
              <div className="metric-value">{currentData.newCustomers}명</div>
              <div className="metric-label">신규 고객</div>
            </div>
            <div className="metric">
              <div className="metric-value">{currentData.repeatCustomers}명</div>
              <div className="metric-label">재방문 고객</div>
            </div>
          </div>

          <div className="insights">
            <div className="insight">
              <h4>주요 문의사항</h4>
              <p>{currentData.topIssue}</p>
            </div>
            <div className="insight">
              <h4>날씨별 패턴</h4>
              <p>{currentData.weatherImpact}</p>
            </div>
            <div className="insight">
              <h4>개선 제안</h4>
              <p className="recommendation">{currentData.recommendation}</p>
            </div>
          </div>
          </>
          )}
        </div>
        
        <div className="demo-features">
          <div className="feature">
            <span className="tick">✓</span>
            <span>예약/체크인/문의 데이터를 엮어 월간 리포트 제공</span>
          </div>
          <div className="feature">
            <span className="tick">✓</span>
            <span>"이번 달 손님이 왜 줄었는가"를 데이터로 설명</span>
          </div>
          <div className="feature">
            <span className="tick">✓</span>
            <span>날씨·요일·타깃별 패턴 분석</span>
          </div>
        </div>
      </div>
    </section>
  )
}
