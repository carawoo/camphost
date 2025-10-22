'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Hero() {
  const [showDemoForm, setShowDemoForm] = useState(false)
  const [demoForm, setDemoForm] = useState({
    campgroundName: '',
    managerName: '',
    phone: ''
  })

  const handleDemoSubmit = async () => {
    if (!demoForm.campgroundName || !demoForm.managerName || !demoForm.phone) {
      alert('모든 필드를 입력해주세요.')
      return
    }
    
    try {
      const response = await fetch('/api/send-demo-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campgroundName: demoForm.campgroundName,
          managerName: demoForm.managerName,
          phone: demoForm.phone,
          timestamp: new Date().toLocaleString('ko-KR')
        })
      })
      
      if (response.ok) {
        alert('데모 보기 신청이 완료되었습니다! 담당자가 연락드릴 예정입니다.')
        setShowDemoForm(false)
        setDemoForm({ campgroundName: '', managerName: '', phone: '' })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || '서버 응답 오류')
      }
    } catch (error) {
      console.error('신청 처리 오류:', error)
      alert('신청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  return (
    <section className="wrap hero">
      <span className="kicker">캠핑장 운영 자동화</span>
      <h1>
        사장님이 잠시 자리를 비워도
        <br />
        캠핑장은 돌아갑니다.
      </h1>
      <p>
        무인 체크인 · <b>온담</b> 문의함 · <b>위브</b> 리포트. 종이와 전화 대신, 조용한 자동화로 운영 스트레스를 줄입니다.
      </p>
      <div className="cta">
        <Link href="#apply" className="btn">
          베타 신청하기
        </Link>
        <button className="btn btn-outline" onClick={() => setShowDemoForm(true)}>
          데모 보기 신청하기
        </button>
      </div>
      <div className="pill">
        <span className="chip">상주 없이 체크인</span>
        <span className="chip">예약 리스트 자동 매칭</span>
        <span className="chip">클레임 감소</span>
        <span className="chip">월 리포트 제공</span>
      </div>
      
      {/* 데모 신청 모달 */}
      {showDemoForm && (
        <div className="demo-modal-overlay" onClick={() => setShowDemoForm(false)}>
          <div className="demo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>데모 보기 신청</h3>
              <button 
                className="close-btn"
                onClick={() => setShowDemoForm(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <p>오도이촌 데모를 체험해보세요. 담당자가 직접 연락드려 안내해드립니다.</p>
              <div className="form-group">
                <label>캠핑장 이름 *</label>
                <input 
                  type="text" 
                  value={demoForm.campgroundName}
                  onChange={(e) => setDemoForm({...demoForm, campgroundName: e.target.value})}
                  placeholder="캠핑장 이름을 입력하세요"
                />
              </div>
              <div className="form-group">
                <label>담당자 이름 *</label>
                <input 
                  type="text" 
                  value={demoForm.managerName}
                  onChange={(e) => setDemoForm({...demoForm, managerName: e.target.value})}
                  placeholder="담당자 이름을 입력하세요"
                />
              </div>
              <div className="form-group">
                <label>연락처 *</label>
                <input 
                  type="tel" 
                  value={demoForm.phone}
                  onChange={(e) => setDemoForm({...demoForm, phone: e.target.value})}
                  placeholder="연락처를 입력하세요"
                />
              </div>
              <div className="modal-actions">
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowDemoForm(false)}
                >
                  취소
                </button>
                <button 
                  className="btn"
                  onClick={handleDemoSubmit}
                >
                  데모 신청하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}