import Image from 'next/image'

export default function SolutionSection() {
  return (
    <section id="demo" className="wrap section">
      <h2 className="title">오도이촌이 대신합니다</h2>
      <p className="subtitle">무인 체크인 · 온담(문의함) · 위브(리포트) — 3가지만으로 시작.</p>

             {/* 무인 체크인 프로세스 이미지 */}
             <div className="process-images">
               <div className="process-image-container">
                 <Image
                   src="/checkin-process.png"
                   alt="무인 체크인 프로세스"
                   width={800}
                   height={400}
                   className="process-image desktop-image"
                 />
                 <Image
                   src="/Desktop - 4.png"
                   alt="무인 체크인 프로세스 (모바일)"
                   width={800}
                   height={400}
                   className="process-image mobile-image"
                 />
               </div>
               <div className="process-image-container">
                 <Image
                   src="/registration-process.png"
                   alt="예약 등록 프로세스"
                   width={800}
                   height={400}
                   className="process-image desktop-image"
                 />
                 <Image
                   src="/Desktop - 5.png"
                   alt="예약 등록 프로세스 (모바일)"
                   width={800}
                   height={400}
                   className="process-image mobile-image"
                 />
               </div>
               <div className="process-image-container">
                 <Image
                   src="/Desktop - 3.png"
                   alt="체크인 완료 시 안내 문자 전송"
                   width={800}
                   height={400}
                   className="process-image desktop-image"
                 />
                 <Image
                   src="/Desktop - 6.png"
                   alt="체크인 완료 시 안내 문자 전송 (모바일)"
                   width={800}
                   height={400}
                   className="process-image mobile-image"
                 />
               </div>
               <div className="process-image-container">
                 <Image
                   src="/온담.png"
                   alt="온담 문의함 프로세스"
                   width={800}
                   height={400}
                   className="process-image desktop-image"
                 />
                 <Image
                   src="/온담-1.png"
                   alt="온담 문의함 프로세스 (모바일)"
                   width={800}
                   height={400}
                   className="process-image mobile-image"
                 />
               </div>
             </div>

      {/* 무인 체크인 설명 */}
      <div className="checkin-description">
        <div className="description-item">
          <span className="step-number">1</span>
          <span className="description-text">사장님이 예약 플랫폼에서 확인한 예약을 시스템에 등록</span>
        </div>
        <div className="description-item">
          <span className="step-number">2</span>
          <span className="description-text">고객이 이름·연락처 입력 → 예약 리스트 자동 매칭 → 입실 완료</span>
        </div>
        <div className="description-item">
          <span className="step-number">3</span>
          <span className="description-text">야간 입실/늦은 퇴실도 무리 없이 처리</span>
        </div>
        <div className="description-item">
          <span className="step-number">4</span>
          <span className="description-text">종이·전화·대기 제거</span>
        </div>
      </div>

      <div className="grid grid-2">

        <div className="card">
          <h3>온담 (문의함)</h3>
          <ul className="list">
            <li>
              <span className="tick">✓</span>
              <span>사장님 부재 중에도 고객이 메시지 남김</span>
            </li>
            <li>
              <span className="tick">✓</span>
              <span>자주 묻는 질문 자동응답 / 문자 알림</span>
            </li>
            <li>
              <span className="tick">✓</span>
              <span>안내페이지(지도·매너타임·분리수거) 자동 제공</span>
            </li>
          </ul>
        </div>

        <div className="card">
          <h3>위브 (리포트)</h3>
          <ul className="list">
            <li>
              <span className="tick">✓</span>
              <span>예약/체크인/문의 데이터를 엮어 월간 리포트 제공</span>
            </li>
            <li>
              <span className="tick">✓</span>
              <span>"이번 달 손님이 왜 줄었는가"를 데이터로 설명</span>
            </li>
            <li>
              <span className="tick">✓</span>
              <span>날씨·요일·타깃별 패턴 분석</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

