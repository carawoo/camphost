export default function ImpactSection() {
  return (
    <section className="wrap section">
      <h2 className="title">기대 효과</h2>
      <div className="grid grid-3">
        <div className="card">
          <h3>운영시간 확장</h3>
          <p className="muted">
            야간 입실/늦은 퇴실 자동화 → 예약 가동률 <b>+10~15%</b>
          </p>
        </div>
        <div className="card">
          <h3>리뷰 품질 개선</h3>
          <p className="muted">
            체크인 지연·반복 문의 감소 → 신규 유입 <b>+5~10%</b>
          </p>
        </div>
        <div className="card">
          <h3>인건비 절감</h3>
          <p className="muted">
            상주 인건비 일부 대체 → 순이익 <b>+20~30%</b>
          </p>
        </div>
      </div>
      <p className="muted" style={{ marginTop: '10px' }}>
        * 실제 수치는 규모/시즌에 따라 상이합니다.
      </p>
    </section>
  )
}

