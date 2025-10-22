'use client'

import { useState } from 'react'
import Link from 'next/link'
import './admin.css'

export default function AdminPage() {
  const [loginForm, setLoginForm] = useState({
    campgroundName: '',
    password: ''
  })
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [helpForm, setHelpForm] = useState({
    campgroundName: '',
    managerName: '',
    phone: '',
    email: ''
  })
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetForm, setResetForm] = useState({
    campgroundName: '',
    managerName: '',
    phone: '',
    email: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!loginForm.campgroundName || !loginForm.password) {
      alert('캠핑장 이름과 비밀번호를 입력해주세요.')
      return
    }

    try {
      // 로그인 API 호출
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm)
      })

      if (response.ok) {
        const data = await response.json()
        alert('로그인 성공! 관리자 페이지로 이동합니다.')
        // 실제로는 관리자 대시보드로 리다이렉트
        console.log('로그인 성공:', data)
      } else {
        const errorData = await response.json()
        alert(errorData.error || '로그인에 실패했습니다.')
      }
    } catch (error) {
      console.error('로그인 오류:', error)
      alert('로그인 처리 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-card">
          <Link href="/" className="back-link">← 메인으로</Link>
          <div className="login-header">
            <div className="logo">
              <span className="logo-icon">🏕️</span>
              <h1>오도이촌 캠지기 센터</h1>
            </div>
            <p className="welcome-text">캠지기 센터에 오신걸 환영합니다</p>
            <div className="chip">베타 모집</div>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="campgroundName">캠핑장 이름</label>
              <input
                type="text"
                id="campgroundName"
                value={loginForm.campgroundName}
                onChange={(e) => setLoginForm({...loginForm, campgroundName: e.target.value})}
                placeholder="캠핑장 이름을 입력하세요"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>

            <button type="submit" className="login-btn">
              로그인
            </button>
          </form>

          <div className="login-links">
            <div className="member-links">
              <a href="https://forms.gle/qVeN9xv8aiADqDmx9" target="_blank" rel="noopener">
                입점 문의 (구글폼)
              </a>
            </div>
            <div className="help-links">
              <button 
                type="button" 
                className="btn-link"
                onClick={() => setShowHelpModal(true)}
              >
                회원정보를 잊으셨나요? 메일로 문의
              </button>
              <button
                type="button"
                className="btn-link"
                onClick={() => setShowResetModal(true)}
              >
                비밀번호 재설정 메일 요청
              </button>
            </div>
          </div>

          {/* <div className="support-section">
            <h3>[문의 및 기술지원]</h3>
            <div className="support-links">
              <Link href="/admin/inquiry">입점 문의 : 입점하기</Link>
              <Link href="/admin/chat">기능 문의 : 채팅 상담하기</Link>
            </div>
            <p className="support-hours">
              평일 10:00 ~ 18:00 / 점심시간 13:00 ~ 14:00 / 주말, 공휴일 휴무
            </p>
          </div> */}
        </div>

        {/* 회원정보 문의 모달 */}
        {showHelpModal && (
          <div className="demo-modal-overlay" onClick={() => setShowHelpModal(false)}>
            <div className="demo-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>회원정보 문의</h3>
                <button className="close-btn" onClick={() => setShowHelpModal(false)}>×</button>
              </div>
              <div className="modal-content">
                <p>캠지기 계정/회원정보 관련 문의를 남겨주세요. 담당자에게 바로 전달됩니다.</p>
                <div className="form-group">
                  <label>캠핑장 이름 *</label>
                  <input 
                    type="text" 
                    value={helpForm.campgroundName}
                    onChange={(e) => setHelpForm({ ...helpForm, campgroundName: e.target.value })}
                    placeholder="예) 오도이촌캠핑장"
                  />
                </div>
                <div className="form-group">
                  <label>담당자명 *</label>
                  <input 
                    type="text" 
                    value={helpForm.managerName}
                    onChange={(e) => setHelpForm({ ...helpForm, managerName: e.target.value })}
                    placeholder="예) 홍길동"
                  />
                </div>
                <div className="form-group">
                  <label>연락처 *</label>
                  <input 
                    type="tel" 
                    value={helpForm.phone}
                    onChange={(e) => setHelpForm({ ...helpForm, phone: e.target.value })}
                    placeholder="예) 010-1234-5678"
                  />
                </div>
                <div className="form-group">
                  <label>메일 주소 *</label>
                  <input 
                    type="email" 
                    value={helpForm.email}
                    onChange={(e) => setHelpForm({ ...helpForm, email: e.target.value })}
                    placeholder="예) example@camp.com"
                  />
                </div>
                <div className="modal-actions">
                  <button className="btn btn-outline" onClick={() => setShowHelpModal(false)}>취소</button>
                  <button 
                    className="btn"
                    onClick={async () => {
                      if (!helpForm.campgroundName || !helpForm.managerName || !helpForm.phone || !helpForm.email) {
                        alert('필수 항목을 모두 입력해주세요.')
                        return
                      }
                      try {
                        const res = await fetch('/api/admin/help-email', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            campgroundName: helpForm.campgroundName,
                            managerName: helpForm.managerName,
                            phone: helpForm.phone,
                            email: helpForm.email,
                            timestamp: new Date().toLocaleString('ko-KR')
                          })
                        })
                        if (res.ok) {
                          alert('문의가 접수되었습니다. 담당자가 메일로 안내드리겠습니다.')
                          setShowHelpModal(false)
                          setHelpForm({ campgroundName: '', managerName: '', phone: '', email: '' })
                        } else {
                          const data = await res.json()
                          throw new Error(data.error || '전송 오류')
                        }
                      } catch (err) {
                        console.error(err)
                        alert('전송 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.')
                      }
                    }}
                  >
                    메일로 문의 보내기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 비밀번호 재설정 요청 모달 */}
        {showResetModal && (
          <div className="demo-modal-overlay" onClick={() => setShowResetModal(false)}>
            <div className="demo-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>비밀번호 재설정 메일 요청</h3>
                <button className="close-btn" onClick={() => setShowResetModal(false)}>×</button>
              </div>
              <div className="modal-content">
                <p>
                  아래 정보를 입력해주시면 담당자가 확인 후 비밀번호 재설정 메일을 보내드립니다.
                  급할 경우, <b>carawoo96@gmail.com</b> 으로 직접 메일을 보내주세요.
                </p>
                <div className="form-group">
                  <label>캠핑장 이름 *</label>
                  <input
                    type="text"
                    value={resetForm.campgroundName}
                    onChange={(e) => setResetForm({ ...resetForm, campgroundName: e.target.value })}
                    placeholder="예) 오도이촌캠핑장"
                  />
                </div>
                <div className="form-group">
                  <label>담당자명 *</label>
                  <input
                    type="text"
                    value={resetForm.managerName}
                    onChange={(e) => setResetForm({ ...resetForm, managerName: e.target.value })}
                    placeholder="예) 홍길동"
                  />
                </div>
                <div className="form-group">
                  <label>연락처 *</label>
                  <input
                    type="tel"
                    value={resetForm.phone}
                    onChange={(e) => setResetForm({ ...resetForm, phone: e.target.value })}
                    placeholder="예) 010-1234-5678"
                  />
                </div>
                <div className="form-group">
                  <label>이메일 주소 *</label>
                  <input
                    type="email"
                    value={resetForm.email}
                    onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
                    placeholder="예) example@camp.com"
                  />
                </div>
                <div className="modal-actions">
                  <button className="btn btn-outline" onClick={() => setShowResetModal(false)}>취소</button>
                  <button
                    className="btn"
                    onClick={async () => {
                      if (!resetForm.campgroundName || !resetForm.managerName || !resetForm.phone || !resetForm.email) {
                        alert('필수 항목을 모두 입력해주세요.')
                        return
                      }
                      try {
                        const res = await fetch('/api/admin/reset-email', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            ...resetForm,
                            timestamp: new Date().toLocaleString('ko-KR')
                          })
                        })
                        if (res.ok) {
                          alert('요청이 접수되었습니다. 담당자가 메일로 안내드리겠습니다.')
                          setShowResetModal(false)
                          setResetForm({ campgroundName: '', managerName: '', phone: '', email: '' })
                        } else {
                          const data = await res.json()
                          throw new Error(data.error || '전송 오류')
                        }
                      } catch (err) {
                        console.error(err)
                        alert('전송 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.')
                      }
                    }}
                  >
                    재설정 메일 요청 보내기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
