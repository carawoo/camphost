'use client'

import Link from 'next/link'

export default function Hero() {

  return (
    <section className="wrap hero">
      <span className="kicker">캠핑장 운영 자동화</span>
      <h1>
        사장님이 잠시 자리를 비워도
        <br />
        캠핑장은 돌아갑니다.
      </h1>
      <p>
        무인 체크인 · <b>온담</b> 문의함 · <b>위브</b> 리포트. 종이와 전화 대신, 조용한 자동화로 운영 스트레스를 줄입니다.
      </p>
      <div className="cta">
        <Link href="#apply" className="btn">
          베타 신청하기
        </Link>
      </div>
      <div className="pill">
        <span className="chip">상주 없이 체크인</span>
        <span className="chip">예약 리스트 자동 매칭</span>
        <span className="chip">클레임 감소</span>
        <span className="chip">월 리포트 제공</span>
      </div>
    </section>
  )
}