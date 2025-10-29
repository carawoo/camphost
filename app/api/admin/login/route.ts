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

    // Supabase에서 캠핑장 조회 및 비밀번호 확인
    if (supabaseRest.isEnabled()) {
      try {
        // 1) 정확히 일치하는 이름으로 조회
        let rows = await supabaseRest.select<any[]>(
          'campgrounds',
          `?name=eq.${encodeURIComponent(campgroundName)}&select=id,name,admin_password`
        )
        let camp = rows && rows[0]
        
        // 2) 없으면 ilike로 느슨 검색
        if (!camp) {
          rows = await supabaseRest.select<any[]>(
            'campgrounds',
            `?name=ilike.${encodeURIComponent(`*${campgroundName}*`)}&select=id,name,admin_password`
          )
          camp = rows && rows[0]
        }
        
        if (camp) {
          const storedPassword = camp.admin_password || '0000' // 기본값
          console.log(`[Login API] Found campground: ${camp.name}, stored password: ${storedPassword}, input password: ${password}`)
          if (storedPassword === password) {
            return NextResponse.json({
              success: true,
              message: '로그인 성공',
              campgroundName: camp.name,
              token: 'temp_token_' + Date.now()
            })
          } else {
            console.log(`[Login API] Password mismatch for ${camp.name}`)
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
