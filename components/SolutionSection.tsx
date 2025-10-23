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

      {/* 온담 문의함 프로세스 이미지 */}
      <div className="process-images">
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
        <div className="process-image-container">
          <Image
            src="/온담2.png"
            alt="온담 문의함 프로세스 2"
            width={800}
            height={400}
            className="process-image desktop-image"
          />
          <Image
            src="/온담2-1.png"
            alt="온담 문의함 프로세스 2 (모바일)"
            width={800}
            height={400}
            className="process-image mobile-image"
          />
        </div>
      </div>

      {/* 온담 설명 */}
      <div className="ondam-description">
        <div className="description-item">
          <span className="step-number">1</span>
          <span className="description-text">사장님이 자주 묻는 질문에 대한 자동응답을 미리 설정</span>
        </div>
        <div className="description-item">
          <span className="step-number">2</span>
          <span className="description-text">고객이 문의 입력 → AI 자동 응답 → 사장님에게 알림</span>
        </div>
        <div className="description-item">
          <span className="step-number">3</span>
          <span className="description-text">24시간 자동 응답으로 고객 만족도 향상</span>
        </div>
        <div className="description-item">
          <span className="step-number">4</span>
          <span className="description-text">문의 내역 자동 기록 및 관리</span>
        </div>
      </div>

      {/* 위브 리포트 프로세스 이미지 */}
      <div className="process-images">
        <div className="process-image-container">
          <Image
            src="/위브.png"
            alt="위브 리포트 프로세스"
            width={800}
            height={400}
            className="process-image desktop-image"
          />
          <Image
            src="/위브-1.png"
            alt="위브 리포트 프로세스 (모바일)"
            width={800}
            height={400}
            className="process-image mobile-image"
          />
        </div>
      </div>

      {/* 위브 설명 */}
      <div className="weave-description">
        <div className="description-item">
          <span className="step-number">1</span>
          <span className="description-text">체크인/문의/예약 데이터를 실시간으로 수집</span>
        </div>
        <div className="description-item">
          <span className="step-number">2</span>
          <span className="description-text">AI가 운영 패턴과 트렌드를 분석</span>
        </div>
        <div className="description-item">
          <span className="step-number">3</span>
          <span className="description-text">월간 리포트 자동 생성 및 제안사항 제공</span>
        </div>
        <div className="description-item">
          <span className="step-number">4</span>
          <span className="description-text">데이터 기반 운영 개선 방향 제시</span>
        </div>
      </div>

    </section>
  )
}

