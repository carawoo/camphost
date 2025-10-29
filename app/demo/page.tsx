'use client'

import { useState } from 'react'
import DemoHeader from '../../components/DemoHeader'
import CheckinDemo from '../../components/CheckinDemo'
import OndamDemo from '../../components/OndamDemo'
import WeaveDemo from '../../components/WeaveDemo'

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0)
  
  const steps = [
    {
      id: 'intro',
      title: '오도이촌 소개',
      description: '무인 체크인 · 온담(문의함) · 위브(리포트) — 3가지만으로 시작.'
    },
    {
      id: 'checkin',
      title: '무인 체크인 체험',
      description: '고객이 이름을 입력하면 사장님 화면에 자동으로 기록되는 과정을 확인해보세요.'
    },
    {
      id: 'ondam',
      title: '온담 문의함 체험',
      description: '고객 문의가 자동으로 답변되는 과정을 확인해보세요.'
    },
    {
      id: 'weave',
      title: '위브 리포트 체험',
      description: '운영 데이터가 리포트로 정리되는 과정을 확인해보세요.'
    }
  ]

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <section className="demo-hero">
            <div className="wrap">
              <h1>오도이촌이 대신합니다</h1>
              <p className="demo-subtitle">{steps[0].description}</p>
              <div className="demo-notice">
                <p>🏕️ 이 데모는 실제 서비스의 작동 방식을 간단히 보여드리는 시뮬레이션입니다.</p>
                <p>캠퍼가 이름을 입력하면 → 사장님 화면에 자동으로 기록되고 → 이용 안내 문자가 전송되는 과정을 확인할 수 있습니다.</p>
              </div>
              <div className="step-navigation">
                <button 
                  className="btn btn-primary"
                  onClick={() => setCurrentStep(1)}
                >
                  무인 체크인 체험하기 →
                </button>
              </div>
            </div>
          </section>
        )
      case 1:
        return (
          <div>
            <div className="step-intro">
              <div className="wrap">
                <h2>1단계: 무인 체크인</h2>
                <p>{steps[1].description}</p>
                <div className="step-navigation">
                  <button 
                    className="btn btn-outline"
                    onClick={() => setCurrentStep(0)}
                  >
                    ← 이전
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setCurrentStep(2)}
                  >
                    온담 문의함 체험하기 →
                  </button>
                </div>
              </div>
            </div>
            <CheckinDemo />
          </div>
        )
      case 2:
        return (
          <div>
            <div className="step-intro">
              <div className="wrap">
                <h2>2단계: 온담 문의함</h2>
                <p>{steps[2].description}</p>
                <div className="step-navigation">
                  <button 
                    className="btn btn-outline"
                    onClick={() => setCurrentStep(1)}
                  >
                    ← 이전
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setCurrentStep(3)}
                  >
                    위브 리포트 체험하기 →
                  </button>
                </div>
              </div>
            </div>
            <OndamDemo />
          </div>
        )
      case 3:
        return (
          <div>
            <div className="step-intro">
              <div className="wrap">
                <h2>3단계: 위브 리포트</h2>
                <p>{steps[3].description}</p>
                <div className="step-navigation">
                  <button 
                    className="btn btn-outline"
                    onClick={() => setCurrentStep(2)}
                  >
                    ← 이전
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setCurrentStep(0)}
                  >
                    처음부터 다시 →
                  </button>
                </div>
              </div>
            </div>
            <WeaveDemo />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <DemoHeader />
      <main className="demo-main">
        {renderCurrentStep()}
      </main>
    </>
  )
}
