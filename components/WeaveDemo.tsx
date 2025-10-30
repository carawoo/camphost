'use client'

import { useState } from 'react'

export default function WeaveDemo() {
  const [selectedMonth, setSelectedMonth] = useState('2024-12')
  const [step, setStep] = useState(0)
  const [showOverlay, setShowOverlay] = useState(true)
  
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
    setStep(1) // 다음 단계로 진행
  }

  const overlayContent = [
    {
      title: "위브(리포트)가 뭔가요?",
      description: "운영 데이터를 수집하고 분석하여 월간 리포트를 자동으로 생성하는 시스템입니다.",
      benefits: [
        "매출, 가동률, 고객 분석 자동화",
        "운영 패턴과 트렌드 파악",
        "개선점 및 제안사항 도출",
        "데이터 기반 운영 의사결정 지원"
      ]
    },
    {
      title: "어떤 데이터를 분석하나요?",
      description: "체크인, 문의, 예약 등 모든 운영 데이터를 실시간으로 수집합니다.",
      benefits: [
        "체크인 데이터 (고객 정보, 입실 시간)",
        "문의 데이터 (질문 유형, 답변 시간)",
        "예약 데이터 (예약 패턴, 취소율)",
        "날씨, 요일별 패턴 분석"
      ]
    },
    {
      title: "리포트는 어떻게 활용하나요?",
      description: "분석 결과를 바탕으로 운영 개선 방향을 제시합니다.",
      benefits: [
        "월간 매출 및 가동률 현황 파악",
        "고객 만족도 및 개선점 도출",
        "운영 최적화 제안사항 제공",
        "다음 달 운영 계획 수립 지원"
      ]
    }
  ]

  const steps = [
    {
      title: "1단계: 데이터 수집",
      description: "체크인, 문의, 예약 데이터를 실시간으로 수집하여 분석합니다.",
      content: (
        <div className="demo-form">
          <h3>데이터 수집 과정</h3>
          <p className="step-description">운영 중인 모든 데이터가 자동으로 수집됩니다.</p>
          <div className="data-collection">
            <div className="data-item">
              <span className="tick">✓</span>
              <span>체크인 데이터 (고객 정보, 입실 시간)</span>
            </div>
            <div className="data-item">
              <span className="tick">✓</span>
              <span>문의 데이터 (질문 유형, 답변 시간)</span>
            </div>
            <div className="data-item">
              <span className="tick">✓</span>
              <span>예약 데이터 (예약 패턴, 취소율)</span>
            </div>
          </div>
          <button 
            className="btn"
            onClick={() => setStep(1)}
          >
            데이터 분석 시작 →
          </button>
        </div>
      )
    },
    {
      title: "2단계: 패턴 분석",
      description: "수집된 데이터를 분석하여 운영 패턴과 트렌드를 파악합니다.",
      content: (
        <div className="demo-result">
          <div className="checking">
            <div className="spinner"></div>
            <p>데이터 분석 중...</p>
            <small style={{ color: 'var(--sub)', marginTop: '8px', display: 'block' }}>
              고객 행동 패턴, 날씨 영향, 요일별 트렌드를 분석하고 있습니다
            </small>
          </div>
        </div>
      )
    },
    {
      title: "3단계: 리포트 생성",
      description: "분석 결과를 바탕으로 월간 운영 리포트를 자동으로 생성합니다.",
      content: (
        <div className="demo-success">
          <div className="success-icon">📊</div>
          <h3>리포트 생성 완료!</h3>
          <div className="success-details">
            <p>✅ 월간 매출 및 가동률 분석 완료</p>
            <p>📈 고객 만족도 및 개선점 도출</p>
            <p>💡 운영 최적화 제안사항 제공</p>
          </div>
          <button 
            className="btn btn-outline"
            onClick={() => setStep(0)}
          >
            처음부터 다시 →
          </button>
        </div>
      )
    }
  ]

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
