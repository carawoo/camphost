import { NextResponse } from 'next/server'
import { supabaseRest } from '@/services/supabaseRest'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const name = url.searchParams.get('campground') || '오도이촌'
    const guestName = url.searchParams.get('guestName') || '테스트 고객'
    const phone = url.searchParams.get('phone') || '010-1234-5678'
    const checkInDate = url.searchParams.get('checkIn') || new Date().toISOString().split('T')[0]
    const checkOutDate = url.searchParams.get('checkOut') || new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0]

    if (!supabaseRest.isEnabled()) {
      return NextResponse.json({ ok: false, error: 'Supabase env not set' }, { status: 500 })
    }

    // 1) 캠핑장 확보 (없으면 생성)
    const camps = await supabaseRest.select<any[]>('campgrounds', `?name=eq.${encodeURIComponent(name)}&select=*`)
    let camp = camps && camps[0]
    if (!camp) {
      const inserted = await supabaseRest.upsert<any>('campgrounds', {
        id: `dev_${Date.now()}`,
        name,
        owner_name: '개발용',
        owner_email: 'dev@example.com',
        contact_phone: '010-0000-0000',
        contact_email: 'dev@example.com',
        status: 'active',
        subscription_plan: 'basic',
        admin_url: `/admin/dashboard?campground=${encodeURIComponent(name)}`,
        kiosk_url: `/kiosk?campground=${encodeURIComponent(name)}`
      })
      camp = Array.isArray(inserted) ? inserted[0] : inserted
    }

    // 2) 예약 생성
    const reservation = await supabaseRest.insert<any>('reservations', {
      campground_id: camp.id,
      guest_name: guestName,
      phone,
      room_number: 'A-101',
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      guests: 2,
      total_amount: 100000,
      status: 'confirmed'
    })

    const base = `${url.protocol}//${url.host}`
    const kioskUrl = `${base}/kiosk?id=${camp.id}&guestName=${encodeURIComponent(guestName)}&phone=${encodeURIComponent(phone)}`
    const adminUrl = `${base}/admin/reservations?campground=${encodeURIComponent(name)}`

    if (url.searchParams.get('redirect') === '1' || url.searchParams.get('redirect') === 'true') {
      return NextResponse.redirect(kioskUrl)
    }
    return NextResponse.json({ ok: true, camp, reservation, kioskUrl, adminUrl })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 })
  }
}


