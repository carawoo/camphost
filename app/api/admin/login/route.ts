import { NextRequest, NextResponse } from 'next/server'
import { supabaseRest } from '@/services/supabaseRest'

export async function POST(request: NextRequest) {
  try {
    const { campgroundName, password } = await request.json()

    if (!campgroundName || !password) {
      return NextResponse.json(
        { error: '캠핑장 이름과 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // Supabase에서 캠핑장 조회 및 비밀번호 확인 (정확한 일치만)
    if (supabaseRest.isEnabled()) {
      try {
        // 정확히 일치하는 이름으로만 조회
        const rows = await supabaseRest.select<any[]>(
          'campgrounds',
          `?name=eq.${encodeURIComponent(campgroundName)}&select=id,name,admin_password,status`
        )
        const camp = rows && rows[0]

        if (camp) {
          // 삭제된 캠핑장 로그인 차단
          if (camp.status === 'terminated') {
            console.log(`[Login API] Campground ${camp.name} is terminated`)
            return NextResponse.json(
              { error: '삭제된 캠핑장입니다. 로그인할 수 없습니다.' },
              { status: 403 }
            )
          }

          const storedPassword = camp.admin_password || '0000' // 기본값
          console.log(`[Login API] Found campground: ${camp.name}, stored password: ${storedPassword}, input password: ${password}`)
          if (storedPassword === password) {
            return NextResponse.json({
              success: true,
              message: '로그인 성공',
              campgroundName: camp.name,
              campgroundId: camp.id,
              token: 'temp_token_' + Date.now()
            })
          } else {
            console.log(`[Login API] Password mismatch for ${camp.name}`)
            return NextResponse.json(
              { error: '캠핑장 이름 또는 비밀번호가 올바르지 않습니다.' },
              { status: 401 }
            )
          }
        } else {
          console.log(`[Login API] Campground not found: ${campgroundName}`)
        }
      } catch (error) {
        console.error('Supabase 로그인 조회 오류:', error)
      }
    }

    // 폴백: 기존 하드코딩된 목록
    const validCredentials: Record<string, string> = {
      '테스트캠핑장': 'test123',
      '오도이촌캠핑장': 'odoichon2025',
      '오도이촌': '0000',
      'demo': 'demo123'
    }

    if ((validCredentials[campgroundName] ?? '') === password) {
      return NextResponse.json({
        success: true,
        message: '로그인 성공',
        campgroundName: campgroundName,
        token: 'temp_token_' + Date.now()
      })
    }

    return NextResponse.json(
      { error: '캠핑장 이름 또는 비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    )
  } catch (error) {
    console.error('로그인 오류:', error)
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
