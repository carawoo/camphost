import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key')

export async function POST(request: NextRequest) {
  try {
    const { campgroundName, managerName, phone, email, timestamp } = await request.json()

    if (!campgroundName || !managerName || !phone || !email) {
      return NextResponse.json({ error: '필수 항목 누락' }, { status: 400 })
    }

    const subject = '[오도이촌 캠지기] 비밀번호 재설정 요청'
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color:#2F7D32;">비밀번호 재설정 요청이 접수되었습니다</h2>
        <div style="background:#f5f5f5;padding:16px;border-radius:8px;">
          <p><strong>캠핑장 이름:</strong> ${campgroundName}</p>
          <p><strong>담당자명:</strong> ${managerName}</p>
          <p><strong>연락처:</strong> ${phone}</p>
          <p><strong>이메일 주소:</strong> ${email}</p>
          <p><strong>요청 시각:</strong> ${timestamp}</p>
        </div>
        <p style="color:#666;margin-top:16px;">담당자가 확인 후 재설정 안내 메일을 발송하겠습니다.</p>
      </div>
    `

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'carawoo96@gmail.com',
      subject,
      html
    })

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error('reset-email error', error)
    return NextResponse.json({ error: '전송 실패' }, { status: 500 })
  }
}


