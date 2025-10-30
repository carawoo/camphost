// 캠핑장 관리 시스템
export interface Campground {
  id: string
  name: string
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  contactPhone: string
  contactEmail: string
  address: string
  description: string
  status: 'active' | 'pending' | 'suspended' | 'terminated'
  subscriptionPlan: 'basic' | 'premium' | 'enterprise'
  createdAt: string
  lastActiveAt: string
  adminUrl: string
  kioskUrl: string
}

const CAMPGROUNDS_STORAGE_KEY = 'odoichon_campgrounds'
const SUPER_ADMIN_KEY = 'odoichon_super_admin'

// 슈퍼 어드민 정보
export interface SuperAdmin {
  id: string
  username: string
  email: string
  isAuthenticated: boolean
}

// 기본 슈퍼 어드민 정보
const defaultSuperAdmin: SuperAdmin = {
  id: 'super_admin',
  username: 'admin',
  email: 'admin@odoichon.com',
  isAuthenticated: false
}

// 샘플 캠핑장 데이터
const sampleCampgrounds: Campground[] = [
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
    status: 'active',
    subscriptionPlan: 'premium',
    createdAt: '2025-01-01',
    lastActiveAt: new Date().toISOString(),
    adminUrl: '/admin/dashboard?campground=오도이촌',
    kioskUrl: '/kiosk?campground=오도이촌'
  },
  {
    id: 'test_campground',
    name: '테스트 캠핑장',
    ownerName: '이사장',
    ownerEmail: 'test@example.com',
    ownerPhone: '010-9876-5432',
    contactPhone: '010-9876-5432',
    contactEmail: 'test@example.com',
    address: '강원도 춘천시 테스트동',
    description: '테스트용 캠핑장',
    status: 'pending',
    subscriptionPlan: 'basic',
    createdAt: '2025-01-15',
    lastActiveAt: '2025-01-20',
    adminUrl: '/admin/dashboard?campground=테스트캠핑장',
    kioskUrl: '/kiosk?campground=테스트캠핑장'
  }
]

// 슈퍼 어드민 인증
export const authenticateSuperAdmin = (username: string, password: string): boolean => {
  if (username === 'admin' && password === 'admin123') {
    const superAdmin = { ...defaultSuperAdmin, isAuthenticated: true }
    localStorage.setItem(SUPER_ADMIN_KEY, JSON.stringify(superAdmin))
    return true
  }
  return false
}

// 슈퍼 어드민 상태 확인
export const getSuperAdminStatus = (): SuperAdmin => {
  if (typeof window === 'undefined') return defaultSuperAdmin
  
  try {
    const stored = localStorage.getItem(SUPER_ADMIN_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    return defaultSuperAdmin
  } catch (error) {
    console.error('Failed to load super admin status:', error)
    return defaultSuperAdmin
  }
}

// 슈퍼 어드민 로그아웃
export const logoutSuperAdmin = (): void => {
  localStorage.removeItem(SUPER_ADMIN_KEY)
}

// 모든 캠핑장 조회
export const getAllCampgrounds = (): Campground[] => {
  if (typeof window === 'undefined') return sampleCampgrounds
  
  try {
    const stored = localStorage.getItem(CAMPGROUNDS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    // 초기 데이터 저장
    localStorage.setItem(CAMPGROUNDS_STORAGE_KEY, JSON.stringify(sampleCampgrounds))
    return sampleCampgrounds
  } catch (error) {
    console.error('Failed to load campgrounds:', error)
    return sampleCampgrounds
  }
}

// 캠핑장 저장
export const saveCampgrounds = (campgrounds: Campground[]): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(CAMPGROUNDS_STORAGE_KEY, JSON.stringify(campgrounds))
  } catch (error) {
    console.error('Failed to save campgrounds:', error)
  }
}

// 새 캠핑장 추가
export const addCampground = (campgroundData: Omit<Campground, 'createdAt' | 'lastActiveAt' | 'adminUrl' | 'kioskUrl'> | Omit<Campground, 'id' | 'createdAt' | 'lastActiveAt' | 'adminUrl' | 'kioskUrl'>): Campground => {
  const campgrounds = getAllCampgrounds()
  const newCampground: Campground = {
    // Use provided ID (from Supabase) or generate new one
    id: 'id' in campgroundData ? campgroundData.id : Date.now().toString(),
    ...campgroundData,
    createdAt: new Date().toISOString().split('T')[0],
    lastActiveAt: new Date().toISOString(),
    adminUrl: `/admin/dashboard?campground=${encodeURIComponent(campgroundData.name)}`,
    kioskUrl: `/kiosk?campground=${encodeURIComponent(campgroundData.name)}`
  }

  const updatedCampgrounds = [...campgrounds, newCampground]
  saveCampgrounds(updatedCampgrounds)
  return newCampground
}

// 캠핑장 상태 업데이트
export const updateCampgroundStatus = (id: string, status: Campground['status']): boolean => {
  const campgrounds = getAllCampgrounds()
  const updatedCampgrounds = campgrounds.map(campground => 
    campground.id === id 
      ? { ...campground, status, lastActiveAt: new Date().toISOString() }
      : campground
  )
  
  saveCampgrounds(updatedCampgrounds)
  return true
}

// 캠핑장 삭제
export const deleteCampground = (id: string): boolean => {
  const campgrounds = getAllCampgrounds()
  const updatedCampgrounds = campgrounds.filter(campground => campground.id !== id)
  
  saveCampgrounds(updatedCampgrounds)
  return true
}

// 캠핑장 정보 업데이트
export const updateCampground = (id: string, updates: Partial<Campground>): boolean => {
  const campgrounds = getAllCampgrounds()
  const updatedCampgrounds = campgrounds.map(campground => 
    campground.id === id 
      ? { ...campground, ...updates, lastActiveAt: new Date().toISOString() }
      : campground
  )
  
  saveCampgrounds(updatedCampgrounds)
  return true
}

// 상태별 캠핑장 필터링
export const getCampgroundsByStatus = (status: Campground['status']): Campground[] => {
  const campgrounds = getAllCampgrounds()
  return campgrounds.filter(campground => campground.status === status)
}

// 캠핑장 검색
export const searchCampgrounds = (query: string): Campground[] => {
  const campgrounds = getAllCampgrounds()
  const lowercaseQuery = query.toLowerCase()
  
  return campgrounds.filter(campground => 
    campground.name.toLowerCase().includes(lowercaseQuery) ||
    campground.ownerName.toLowerCase().includes(lowercaseQuery) ||
    campground.address.toLowerCase().includes(lowercaseQuery)
  )
}
