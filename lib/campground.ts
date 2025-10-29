// 캠핑장 정보 관리 유틸리티
export interface CampgroundInfo {
  id: string
  name: string
  contactPhone: string
  contactEmail: string
  address: string
  description: string
}

const CAMPGROUND_STORAGE_KEY = 'odoichon_campground_info'

// 기본 캠핑장 정보
const defaultCampgroundInfo: CampgroundInfo = {
  id: 'odoichon',
  name: '오도이촌 캠핑장',
  contactPhone: '010-1234-5678',
  contactEmail: 'carawoo96@gmail.com',
  address: '경기도 양평군 오도이촌',
  description: '도심과 자연을 잇는 캠핑장'
}

// 캠핑장 정보 가져오기
export const getCampgroundInfo = (): CampgroundInfo => {
  if (typeof window === 'undefined') return defaultCampgroundInfo
  
  try {
    const stored = localStorage.getItem(CAMPGROUND_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    // 기본 정보 저장
    localStorage.setItem(CAMPGROUND_STORAGE_KEY, JSON.stringify(defaultCampgroundInfo))
    return defaultCampgroundInfo
  } catch (error) {
    console.error('Failed to load campground info:', error)
    return defaultCampgroundInfo
  }
}

// 캠핑장 정보 저장
export const saveCampgroundInfo = (info: CampgroundInfo): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(CAMPGROUND_STORAGE_KEY, JSON.stringify(info))
  } catch (error) {
    console.error('Failed to save campground info:', error)
  }
}

// 캠핑장 정보 업데이트
export const updateCampgroundInfo = (updates: Partial<CampgroundInfo>): CampgroundInfo => {
  const currentInfo = getCampgroundInfo()
  const updatedInfo = { ...currentInfo, ...updates }
  saveCampgroundInfo(updatedInfo)
  return updatedInfo
}
