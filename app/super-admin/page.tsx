'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { userService } from '@/services'
import { ROUTES, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants'
import { Button, Input } from '@/components/common'
import './super-admin.css'

export default function SuperAdminLogin() {
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // 인증 상태 확인
  useEffect(() => {
    const currentUser = userService.getCurrentUser()
    if (currentUser) {
      setIsAuthenticated(true)
      // Next.js router를 사용하여 리다이렉션
      window.location.replace(ROUTES.SUPER_ADMIN.DASHBOARD)
    }
  }, [])

  // 이미 인증된 경우 로딩 표시
  if (isAuthenticated) {
    return (
      <div className="super-admin-login">
        <div className="login-container">
          <div className="loading">로그인 확인 중...</div>
        </div>
      </div>
    )
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    
    if (!loginForm.username || !loginForm.password) {
      setErrorMessage(ERROR_MESSAGES.REQUIRED)
      setIsLoading(false)
      return
    }

    try {
      const success = userService.authenticateSuperAdmin(loginForm.username, loginForm.password)
      
      if (success) {
        alert(SUCCESS_MESSAGES.LOGIN_SUCCESS)
        window.location.replace(ROUTES.SUPER_ADMIN.DASHBOARD)
      } else {
        setErrorMessage(ERROR_MESSAGES.LOGIN_FAILED)
      }
    } catch (error) {
      setErrorMessage(ERROR_MESSAGES.UNKNOWN_ERROR)
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (field: keyof typeof loginForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errorMessage) setErrorMessage('')
  }

  return (
    <div className="super-admin-login">
      <div className="login-container">
        <div className="login-header">
          <span className="logo-icon">🏕️</span>
          <h1>오도이촌 슈퍼 어드민</h1>
          <p>전체 캠핑장 관리 시스템</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <Input
            label="사용자명"
            value={loginForm.username}
            onChange={updateField('username')}
            placeholder="사용자명을 입력하세요"
            disabled={isLoading}
          />

          <Input
            label="비밀번호"
            type="password"
            value={loginForm.password}
            onChange={updateField('password')}
            placeholder="비밀번호를 입력하세요"
            disabled={isLoading}
          />

          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}

          <Button 
            type="submit" 
            className="login-btn"
            loading={isLoading}
            disabled={isLoading}
          >
            로그인
          </Button>
        </form>

        <div className="login-footer">
          <Link href="/" className="back-link">← 메인으로 돌아가기</Link>
        </div>
      </div>
    </div>
  )
}
