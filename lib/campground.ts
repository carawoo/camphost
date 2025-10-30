// 캠핑장 정보 관리 유틸리티
import { supabaseRest, type SupabaseCampground } from '@/services/supabaseRest'

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

// 캠핑장 정보 가져오기 (동기 - 하위 호환성)
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

// 캠핑장 정보 검증 및 가져오기 (비동기 - DB 검증 포함)
export const validateAndGetCampgroundInfo = async (): Promise<CampgroundInfo> => {
  if (typeof window === 'undefined') return defaultCampgroundInfo

  try {
    const stored = localStorage.getItem(CAMPGROUND_STORAGE_KEY)
    if (!stored) {
      // localStorage에 데이터가 없으면 기본값 저장 후 반환
      localStorage.setItem(CAMPGROUND_STORAGE_KEY, JSON.stringify(defaultCampgroundInfo))
      return defaultCampgroundInfo
    }

    const data: CampgroundInfo = JSON.parse(stored)

    // Supabase가 활성화된 경우에만 검증
    if (supabaseRest.isEnabled()) {
      try {
        // DB에서 캠핑장 존재 여부 확인
        const query = `?id=eq.${encodeURIComponent(data.id)}&select=id,name`
        const rows = await supabaseRest.select<SupabaseCampground[]>('campgrounds', query)

        if (!rows || rows.length === 0) {
          // DB에 없는 캠핑장 → localStorage에서 삭제
          console.warn(`[validateAndGetCampgroundInfo] Removing invalid campground data from localStorage: ${data.name} (id: ${data.id})`)
          localStorage.removeItem(CAMPGROUND_STORAGE_KEY)

          // 기본값 저장 후 반환
          localStorage.setItem(CAMPGROUND_STORAGE_KEY, JSON.stringify(defaultCampgroundInfo))
          return defaultCampgroundInfo
        }

        // DB에 존재하는 캠핑장 → 검증된 데이터 반환
        return data
      } catch (dbError) {
        // Supabase 호출 실패 시 graceful degradation (검증 스킵)
        console.warn('[validateAndGetCampgroundInfo] Supabase validation failed, using cached data:', dbError)
        return data
      }
    }

    // Supabase 비활성화 시 검증 없이 반환
    return data
  } catch (error) {
    console.error('[validateAndGetCampgroundInfo] Failed to validate campground info:', error)
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
