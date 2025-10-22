import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key')

export async function POST(request: NextRequest) {
  try {
    const { campgroundName, managerName, phone, timestamp } = await request.json()

    if (!campgroundName || !managerName || !phone) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      )
    }

    const emailContent = `
새로운 데모 보기 신청이 접수되었습니다.

캠핑장 이름: ${campgroundName}
담당자 이름: ${managerName}
연락처: ${phone}
신청 시간: ${timestamp}

빠른 시일 내에 연락드리시기 바랍니다.

---
오도이촌 데모 신청 시스템
    `.trim()

    console.log('이메일 전송 시도:', { campgroundName, managerName, phone, timestamp })
    
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'carawoo96@gmail.com',
      subject: '오도이촌 데모 보기 신청',
      text: emailContent,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2F7D32;">새로운 데모 보기 신청이 접수되었습니다.</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>캠핑장 이름:</strong> ${campgroundName}</p>
            <p><strong>담당자 이름:</strong> ${managerName}</p>
            <p><strong>연락처:</strong> ${phone}</p>
            <p><strong>신청 시간:</strong> ${timestamp}</p>
          </div>
          
          <p style="color: #666;">빠른 시일 내에 연락드리시기 바랍니다.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            오도이촌 데모 신청 시스템
          </p>
        </div>
      `
    })

    if (error) {
      throw error
    }

    console.log('이메일 전송 성공:', data)
    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (error) {
    console.error('이메일 전송 오류:', error)
    return NextResponse.json(
      { error: '이메일 전송 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
