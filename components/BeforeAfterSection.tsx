export default function BeforeAfterSection() {
  return (
    <section className="wrap section">
      <h2 className="title">도입 전/후 변화</h2>
      <div className="table-wrapper">
        <table className="table">
        <thead>
          <tr>
            <th>기존 운영</th>
            <th>오도이촌 도입 후</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>수기 체크인, 입금 확인 전화</td>
            <td>
              <b>무인 체크인</b> + 예약 리스트 자동 매칭
            </td>
          </tr>
          <tr>
            <td>반복 안내(길·분리수거·매너타임)</td>
            <td>
              <b>온담</b> 자동응답 + 캠핑장 안내페이지
            </td>
          </tr>
          <tr>
            <td>상주 인력 필수</td>
            <td>상주 없이 운영, 피크타임 집중</td>
          </tr>
          <tr>
            <td>감으로 원인 추측</td>
            <td>
              <b>위브</b> 리포트로 원인·대안을 데이터로
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </section>
  )
}

