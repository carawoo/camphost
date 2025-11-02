import { NextRequest, NextResponse } from 'next/server'
import { supabaseRest } from '@/services/supabaseRest'

export async function POST(request: NextRequest) {
  try {
    const { campgroundName, password, ownerName, phone, email } = await request.json()

    // 입력 검증
    if (!campgroundName || !password || !ownerName || !phone || !email) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 비밀번호 길이 검증
    if (password.length < 4) {
      return NextResponse.json(
        { error: '비밀번호는 최소 4자 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    // Supabase가 활성화되어 있지 않으면 에러
    if (!supabaseRest.isEnabled()) {
      return NextResponse.json(
        { error: '회원가입 기능을 사용할 수 없습니다. 관리자에게 문의하세요.' },
        { status: 503 }
      )
    }

    try {
      // 1. 캠핑장 이름 중복 검사
      const existing = await supabaseRest.select<any[]>(
        'campgrounds',
        `?name=eq.${encodeURIComponent(campgroundName)}&select=id`
      )

      if (existing && existing.length > 0) {
        return NextResponse.json(
          { error: '이미 등록된 캠핑장 이름입니다. 다른 이름을 사용해주세요.' },
          { status: 409 }
        )
      }

      // 2. 새 캠핑장 등록
      const newCampground = {
        name: campgroundName,
        owner_name: ownerName,
        owner_email: email,
        contact_phone: phone,
        contact_email: email,
        admin_password: password,
        status: 'active', // 즉시 사용 가능
        subscription_plan: 'basic',
        admin_url: `/admin/dashboard?campground=${encodeURIComponent(campgroundName)}`,
        kiosk_url: `/kiosk?campground=${encodeURIComponent(campgroundName)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const result = await supabaseRest.insert<any[]>('campgrounds', newCampground)
      const created = result && result[0]

      if (!created) {
        throw new Error('캠핑장 등록에 실패했습니다.')
      }

      // URL에 id 파라미터 추가
      const adminUrl = `/admin/dashboard?campground=${encodeURIComponent(campgroundName)}&id=${created.id}`
      const kioskUrl = `/kiosk?campground=${encodeURIComponent(campgroundName)}&id=${created.id}`

      // URL 업데이트
      await supabaseRest.update('campgrounds', {
        admin_url: adminUrl,
        kiosk_url: kioskUrl
      }, `?id=eq.${created.id}`)

      return NextResponse.json({
        success: true,
        message: '회원가입이 완료되었습니다.',
        campgroundName: created.name,
        campgroundId: created.id
      })
    } catch (error: any) {
      console.error('Supabase 회원가입 오류:', error)

      // 중복 키 에러 처리
      if (error.message && error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: '이미 등록된 캠핑장 이름입니다.' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: '회원가입 처리 중 오류가 발생했습니다. 다시 시도해주세요.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('회원가입 오류:', error)
    return NextResponse.json(
      { error: '회원가입 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
