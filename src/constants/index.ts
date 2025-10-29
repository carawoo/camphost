import { AppConfig } from '../types'

// 앱 설정
export const APP_CONFIG: AppConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || '',
  storageKeys: {
    user: 'odoichon_user',
    campgrounds: 'odoichon_campgrounds',
    reservations: 'odoichon_reservations',
    campgroundInfo: 'odoichon_campground_info',
    superAdmin: 'odoichon_super_admin'
  },
  defaultPagination: {
    page: 1,
    limit: 10
  }
}

// 상태 라벨 매핑
export const STATUS_LABELS = {
  campground: {
    active: '진행중',
    pending: '대기중',
    suspended: '일시정지',
    terminated: '계약해지'
  },
  reservation: {
    confirmed: '확정',
    'checked-in': '체크인',
    'checked-out': '체크아웃',
    cancelled: '취소'
  }
} as const

// 구독 플랜 라벨
export const SUBSCRIPTION_PLAN_LABELS = {
  basic: '베이직',
  premium: '프리미엄',
  enterprise: '엔터프라이즈'
} as const

// 상태별 색상
export const STATUS_COLORS = {
  campground: {
    active: '#38a169',
    pending: '#d69e2e',
    suspended: '#e53e3e',
    terminated: '#718096'
  },
  reservation: {
    confirmed: '#3182ce',
    'checked-in': '#38a169',
    'checked-out': '#718096',
    cancelled: '#e53e3e'
  }
} as const

// 라우트 경로
export const ROUTES = {
  HOME: '/',
  SUPER_ADMIN: {
    LOGIN: '/super-admin',
    DASHBOARD: '/super-admin/dashboard'
  },
  ADMIN: {
    LOGIN: '/admin',
    DASHBOARD: '/admin/dashboard',
    RESERVATIONS: '/admin/reservations',
    CHECKIN: '/admin/checkin',
    ROOMS: '/admin/rooms',
    REVENUE: '/admin/revenue'
  },
  KIOSK: '/kiosk'
} as const

// 폼 유효성 검사 규칙
export const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^010-\d{4}-\d{4}$/,
  required: (value: any) => value && value.toString().trim().length > 0,
  minLength: (min: number) => (value: string) => value.length >= min,
  maxLength: (max: number) => (value: string) => value.length <= max
} as const

// 에러 메시지
export const ERROR_MESSAGES = {
  REQUIRED: '필수 항목입니다.',
  INVALID_EMAIL: '올바른 이메일 형식이 아닙니다.',
  INVALID_PHONE: '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)',
  MIN_LENGTH: (min: number) => `최소 ${min}자 이상 입력해주세요.`,
  MAX_LENGTH: (max: number) => `최대 ${max}자까지 입력 가능합니다.`,
  LOGIN_FAILED: '사용자명 또는 비밀번호가 올바르지 않습니다.',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.'
} as const

// 성공 메시지
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '로그인에 성공했습니다.',
  SAVE_SUCCESS: '저장되었습니다.',
  DELETE_SUCCESS: '삭제되었습니다.',
  CHECKIN_SUCCESS: '체크인이 완료되었습니다.',
  REGISTER_SUCCESS: '등록되었습니다.'
} as const

// 기본 데이터
export const DEFAULT_DATA = {
  SUPER_ADMIN: {
    username: '오도이촌',
    password: '0000'
  },
  SAMPLE_CAMPGROUNDS: [
    {
      id: 'odoichon',
      name: '오도이촌 캠핑장',
      ownerName: '김사장',
      ownerEmail: 'carawoo96@gmail.com',
      ownerPhone: '010-1234-5678',
      contactPhone: '010-1234-5678',
      contactEmail: 'carawoo96@gmail.com',
      address: '경기도 양평군 오도이촌',
      description: '도심과 자연을 잇는 캠핑장',
      status: 'active' as const,
      subscriptionPlan: 'premium' as const,
      createdAt: '2025-01-01',
      lastActiveAt: new Date().toISOString(),
      adminUrl: '/admin/dashboard?campground=오도이촌',
      kioskUrl: '/kiosk?campground=오도이촌'
    }
  ]
} as const
