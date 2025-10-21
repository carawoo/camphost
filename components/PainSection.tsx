export default function PainSection() {
  return (
    <section className="wrap section">
      <h2 className="title">지금 운영, 이런 점 힘드시죠</h2>
      <p className="subtitle">전화 응대, 수기 체크인, 반복 안내, 상주 인력… 휴식은 사치가 됩니다.</p>
      <div className="grid grid-3">
        <div className="card warn">
          <h3>수기 체크인</h3>
          <p className="muted">종이 명단·전화 확인·입금 매칭으로 입실 지연과 오류가 발생합니다.</p>
        </div>
        <div className="card warn">
          <h3>반복 안내</h3>
          <p className="muted">분리수거·화장실·사이트 길찾기 등 같은 질문이 계속 들어옵니다.</p>
        </div>
        <div className="card warn">
          <h3>상주 인력 비용</h3>
          <p className="muted">상주 인건비 부담이 큽니다. 쉬고 싶어도 자리를 비우기 어렵습니다.</p>
        </div>
      </div>
    </section>
  )
}

