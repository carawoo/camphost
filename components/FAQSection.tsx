'use client'

import { useState } from 'react'

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "기기(키오스크)가 필요한가요?",
      answer: "아니요. QR 기반 웹으로 시작합니다. 추가 하드웨어 없이 운영 가능합니다."
    },
    {
      question: "예약은 어떻게 확인하나요?",
      answer: "사장님이 네이버/캠핏/땡큐캠핑 등 예약 플랫폼에서 확인한 예약 정보를 오도이촌 시스템에 등록하면, 고객 체크인 시 자동으로 매칭됩니다."
    },
    {
      question: "가격은 얼마인가요?",
      answer: "초기 선정된 업체에 한하여 무료 제공합니다. 자세한 안내는 carawoo96@gmail.com 으로 문의주세요."
    },
    {
      question: "현재 예약 플랫폼과 함께 쓸 수 있나요?",
      answer: "네. 네이버/캠핏/땡큐캠핑 등을 그대로 쓰면서 체크인·안내만 자동화합니다."
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="wrap section">
      <h2 className="title">자주 묻는 질문</h2>
      <div className="faq-accordion">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <button 
              className="faq-question"
              onClick={() => toggleFAQ(index)}
              aria-expanded={openIndex === index}
            >
              <span>{faq.question}</span>
              <span className="faq-icon">
                {openIndex === index ? '−' : '+'}
              </span>
            </button>
            <div className={`faq-answer ${openIndex === index ? 'open' : ''}`}>
              <div className="faq-answer-content">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

