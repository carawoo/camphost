import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// Expect ENV: RESEND_API_KEY

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      campgroundName,
      guestName,
      phone,
      roomNumber,
      checkInDate,
      checkOutDate,
      guests,
      amount,
      contactPhone,
      contactEmail
    } = body || {}

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
    }

    const resend = new Resend(resendKey)

    const to = process.env.NOTIFY_EMAIL || 'odoichon@odoichon.com'

    const subject = `체크인 알림 - ${campgroundName || '캠핑장'}`
    const text = [
      `캠핑장: ${campgroundName || '-'}`,
      `고객명: ${guestName || '-'}`,
      `연락처: ${phone || '-'}`,
      `객실: ${roomNumber || '-'}`,
      `체크인/아웃: ${checkInDate || '-'} ~ ${checkOutDate || '-'}`,
      `인원: ${guests ?? '-'}`,
      `금액: ${typeof amount === 'number' ? amount.toLocaleString() + '원' : '-'}`,
      '',
      `문의(사장님): ${contactPhone || '-'} / ${contactEmail || '-'}`
    ].join('\n')

    await resend.emails.send({
      from: 'Odoichon <no-reply@odoichon.com>',
      to,
      subject,
      text
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'failed to send' }, { status: 500 })
  }
}


