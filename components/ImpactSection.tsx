import Image from 'next/image'

export default function ImpactSection() {
  return (
    <section className="wrap section">
      <h2 className="title">기대 효과</h2>
      
      {/* 기대효과 시각화 */}
      <div className="impact-visualization">
        <div className="impact-chart">
          <div className="chart-item">
            <div className="chart-bar">
              <div className="bar-fill" style={{ height: '85%' }}>
                <span className="bar-label">+10~15%</span>
              </div>
            </div>
            <div className="chart-label">예약 가동률</div>
          </div>
          <div className="chart-item">
            <div className="chart-bar">
              <div className="bar-fill" style={{ height: '70%' }}>
                <span className="bar-label">+5~10%</span>
              </div>
            </div>
            <div className="chart-label">신규 유입</div>
          </div>
          <div className="chart-item">
            <div className="chart-bar">
              <div className="bar-fill" style={{ height: '95%' }}>
                <span className="bar-label">+20~30%</span>
              </div>
            </div>
            <div className="chart-label">순이익</div>
          </div>
        </div>
      </div>

      <div className="grid grid-3">
        <div className="card impact-card">
          <div className="impact-icon">⏰</div>
          <h3>운영시간 확장</h3>
          <p className="muted">
            야간 입실/늦은 퇴실 자동화 → 예약 가동률 <b>+10~15%</b>
          </p>
          <div className="impact-highlight">
            <span className="highlight-number">+10~15%</span>
            <span className="highlight-text">가동률 향상</span>
          </div>
        </div>
        <div className="card impact-card">
          <div className="impact-icon">⭐</div>
          <h3>리뷰 품질 개선</h3>
          <p className="muted">
            체크인 지연·반복 문의 감소 → 신규 유입 <b>+5~10%</b>
          </p>
          <div className="impact-highlight">
            <span className="highlight-number">+5~10%</span>
            <span className="highlight-text">신규 유입</span>
          </div>
        </div>
        <div className="card impact-card">
          <div className="impact-icon">💰</div>
          <h3>인건비 절감</h3>
          <p className="muted">
            상주 인건비 일부 대체 → 순이익 <b>+20~30%</b>
          </p>
          <div className="impact-highlight">
            <span className="highlight-number">+20~30%</span>
            <span className="highlight-text">순이익 증가</span>
          </div>
        </div>
      </div>
      <p className="muted" style={{ marginTop: '20px', textAlign: 'center' }}>
        * 실제 수치는 규모/시즌에 따라 상이합니다.
      </p>
    </section>
  )
}

