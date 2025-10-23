import Image from 'next/image'

export default function SolutionSection() {
  return (
    <section id="demo" className="wrap section">
      <h2 className="title">오도이촌이 대신합니다</h2>
      <p className="subtitle">무인 체크인 · 온담(문의함) · 위브(리포트) — 3가지만으로 시작.</p>

      {/* 무인 체크인 프로세스 이미지 */}
      <div className="section-header">
        <h3>무인 체크인</h3>
        <p>고객이 직접 체크인하고, 사장님은 편하게 쉬세요</p>
      </div>
      <div className="process-images">
               <div className="process-image-container">
                 <Image
                   src="/무인체크인.png"
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
          <span className="description-text">네이버/캠핏에서 "김철수님 예약 있네" 확인하고 시스템에 등록</span>
        </div>
        <div className="description-item">
          <span className="step-number">2</span>
          <span className="description-text">고객이 키오스크에서 "김철수, 010-1234-5678" 입력 → 자동 매칭 → "A-15 사이트입니다"</span>
        </div>
        <div className="description-item">
          <span className="step-number">3</span>
          <span className="description-text">새벽 1시 도착해도 "사장님 잠들어도 괜찮아요" 체크인 완료</span>
        </div>
        <div className="description-item">
          <span className="step-number">4</span>
          <span className="description-text">종이 명단, 전화 확인, 대기줄 모두 사라짐</span>
        </div>
      </div>

      {/* 온담 문의함 프로세스 이미지 */}
      <div className="section-header">
        <h3>온담 (문의함)</h3>
        <p>고객 문의에 24시간 자동으로 답변해드려요</p>
      </div>
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
          <span className="description-text">"화장실 어디예요?" "분리수거 어떻게 해요?" 같은 질문 답변을 미리 준비</span>
        </div>
        <div className="description-item">
          <span className="step-number">2</span>
          <span className="description-text">고객이 QR코드 찍고 질문 → 즉시 답변 받고 → 사장님도 알림 받음</span>
        </div>
        <div className="description-item">
          <span className="step-number">3</span>
          <span className="description-text">새벽 2시에도 "매너타임 언제부터예요?" 질문에 바로 답변</span>
        </div>
        <div className="description-item">
          <span className="step-number">4</span>
          <span className="description-text">"이번 달에 뭘 많이 물어봤는지" 자동으로 정리해서 알려줌</span>
        </div>
      </div>

      {/* 위브 리포트 프로세스 이미지 */}
      <div className="section-header">
        <h3>위브 (리포트)</h3>
        <p>운영 데이터를 분석해서 다음 달 계획을 세워드려요</p>
      </div>
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
          <span className="description-text">"이번 달 손님 몇 명 왔는지, 언제 많이 왔는지" 자동으로 기록</span>
        </div>
        <div className="description-item">
          <span className="step-number">2</span>
          <span className="description-text">"비 오는 날 손님이 줄었네" "주말보다 평일이 더 바빴네" 패턴 분석</span>
        </div>
        <div className="description-item">
          <span className="step-number">3</span>
          <span className="description-text">"다음 달엔 이렇게 해보세요" 제안사항과 함께 리포트 전달</span>
        </div>
        <div className="description-item">
          <span className="step-number">4</span>
          <span className="description-text">"왜 손님이 줄었는지" 데이터로 설명해줌</span>
        </div>
      </div>

    </section>
  )
}

