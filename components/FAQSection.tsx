export default function FAQSection() {
  return (
    <section className="wrap section">
      <h2 className="title">자주 묻는 질문</h2>
      <dl className="faq">
        <dt>기기(키오스크)가 필요한가요?</dt>
        <dd>아니요. QR 기반 웹으로 시작합니다. 추가 하드웨어 없이 운영 가능합니다.</dd>
        <dt>결제는 어떻게 확인하나요?</dt>
        <dd>계좌이체 내역과 예약 정보를 자동 매칭해 입실을 처리합니다.</dd>
        <dt>가격은 얼마인가요?</dt>
        <dd>베타 기간 무료. 이후 소규모 기준 월 9,900원~ (규모별 차등).</dd>
        <dt>현재 예약 플랫폼과 함께 쓸 수 있나요?</dt>
        <dd>네. 네이버/캠핏/땡큐캠핑 등을 그대로 쓰면서 체크인·안내만 자동화합니다.</dd>
      </dl>
    </section>
  )
}

