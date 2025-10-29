import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { campgroundName, password } = await request.json()

    if (!campgroundName || !password) {
      return NextResponse.json(
        { error: '캠핑장 이름과 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 임시 로그인 로직 (실제로는 데이터베이스와 연동)
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
    } else {
      return NextResponse.json(
        { error: '캠핑장 이름 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('로그인 오류:', error)
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
