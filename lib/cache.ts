// Smart Caching 유틸리티 - TTL 기반 localStorage 캐시 관리

/**
 * 캐시 엔트리 구조
 * @template T - 캐시할 데이터의 타입
 */
export interface CacheEntry<T> {
  data: T
  timestamp: number  // 저장 시간 (Date.now())
  ttl: number        // Time To Live (밀리초)
}

/**
 * localStorage 기반 캐시 관리자
 *
 * TTL(Time To Live) 기반 자동 만료 기능을 제공하며,
 * 브라우저 환경에서만 동작합니다 (서버 사이드 안전 처리).
 *
 * @example
 * ```typescript
 * const cache = new CacheManager()
 *
 * // 5분 TTL로 캐싱
 * cache.set('user_123', userData, 300000)
 *
 * // 조회 (만료 시 null 반환)
 * const cached = cache.get<User>('user_123')
 * ```
 */
export class CacheManager {
  private readonly prefix: string = 'camphost_cache_'

  /**
   * 캐시에 데이터 저장
   *
   * @param key - 캐시 키
   * @param data - 저장할 데이터
   * @param ttlMs - Time To Live (밀리초)
   *
   * @example
   * ```typescript
   * cache.set('campground_123', campgroundData, 300000) // 5분 TTL
   * ```
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    // 서버 사이드에서는 동작하지 않음
    if (typeof window === 'undefined') return

    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttlMs
      }

      const storageKey = this.getStorageKey(key)
      localStorage.setItem(storageKey, JSON.stringify(entry))
    } catch (error) {
      // localStorage quota 초과 또는 기타 에러 시 graceful degradation
      console.error(`[CacheManager] Failed to set cache for key "${key}":`, error)
    }
  }

  /**
   * 캐시에서 데이터 조회
   *
   * TTL이 만료된 경우 자동으로 삭제하고 null을 반환합니다.
   *
   * @param key - 캐시 키
   * @returns 캐시된 데이터 또는 null (만료/미존재 시)
   *
   * @example
   * ```typescript
   * const cached = cache.get<CampgroundData>('campground_123')
   * if (cached) {
   *   console.log('Cache hit:', cached)
   * } else {
   *   console.log('Cache miss or expired')
   * }
   * ```
   */
  get<T>(key: string): T | null {
    // 서버 사이드에서는 항상 null 반환
    if (typeof window === 'undefined') return null

    try {
      const storageKey = this.getStorageKey(key)
      const stored = localStorage.getItem(storageKey)

      if (!stored) {
        return null
      }

      const entry = JSON.parse(stored) as CacheEntry<T>

      // TTL 만료 확인
      const now = Date.now()
      const expiresAt = entry.timestamp + entry.ttl

      if (now >= expiresAt) {
        // 만료된 캐시 자동 삭제
        localStorage.removeItem(storageKey)
        return null
      }

      return entry.data
    } catch (error) {
      // JSON parse 실패 또는 기타 에러 시 null 반환
      console.error(`[CacheManager] Failed to get cache for key "${key}":`, error)
      return null
    }
  }

  /**
   * 특정 캐시 무효화 (삭제)
   *
   * @param key - 캐시 키
   *
   * @example
   * ```typescript
   * cache.invalidate('campground_123')
   * ```
   */
  invalidate(key: string): void {
    if (typeof window === 'undefined') return

    try {
      const storageKey = this.getStorageKey(key)
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.error(`[CacheManager] Failed to invalidate cache for key "${key}":`, error)
    }
  }

  /**
   * 모든 캐시 삭제
   *
   * camphost_cache_ 접두사를 가진 모든 localStorage 항목을 삭제합니다.
   *
   * @example
   * ```typescript
   * cache.clear()
   * ```
   */
  clear(): void {
    if (typeof window === 'undefined') return

    try {
      const keysToRemove: string[] = []

      // localStorage의 모든 키를 순회하며 캐시 키 수집
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key)
        }
      }

      // 수집된 캐시 키 삭제
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.error('[CacheManager] Failed to clear cache:', error)
    }
  }

  /**
   * 캐시 만료 여부 확인
   *
   * @param key - 캐시 키
   * @returns true: 만료됨 또는 존재하지 않음, false: 유효함
   *
   * @example
   * ```typescript
   * if (cache.isExpired('campground_123')) {
   *   console.log('Cache expired or not found')
   * }
   * ```
   */
  isExpired(key: string): boolean {
    if (typeof window === 'undefined') return true

    try {
      const storageKey = this.getStorageKey(key)
      const stored = localStorage.getItem(storageKey)

      if (!stored) {
        return true
      }

      const entry = JSON.parse(stored) as CacheEntry<unknown>
      const now = Date.now()
      const expiresAt = entry.timestamp + entry.ttl

      return now >= expiresAt
    } catch (error) {
      console.error(`[CacheManager] Failed to check expiration for key "${key}":`, error)
      return true
    }
  }

  /**
   * 캐시 통계 조회
   *
   * @returns 캐시 키 개수와 총 크기 (바이트)
   *
   * @example
   * ```typescript
   * const stats = cache.getStats()
   * console.log(`Total keys: ${stats.totalKeys}, Size: ${stats.totalSize} bytes`)
   * ```
   */
  getStats(): { totalKeys: number; totalSize: number } {
    if (typeof window === 'undefined') {
      return { totalKeys: 0, totalSize: 0 }
    }

    try {
      let totalKeys = 0
      let totalSize = 0

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.prefix)) {
          totalKeys++
          const value = localStorage.getItem(key)
          if (value) {
            // UTF-16 인코딩 기준 크기 계산 (각 문자 2바이트)
            totalSize += key.length * 2 + value.length * 2
          }
        }
      }

      return { totalKeys, totalSize }
    } catch (error) {
      console.error('[CacheManager] Failed to get cache stats:', error)
      return { totalKeys: 0, totalSize: 0 }
    }
  }

  /**
   * localStorage 저장 키 생성
   *
   * @param key - 캐시 키
   * @returns 접두사가 포함된 전체 키
   */
  private getStorageKey(key: string): string {
    return `${this.prefix}${key}`
  }
}

/**
 * 기본 캐시 매니저 인스턴스 (싱글톤 패턴)
 *
 * @example
 * ```typescript
 * import { cacheManager } from '@/lib/cache'
 *
 * cacheManager.set('key', data, 300000)
 * const cached = cacheManager.get('key')
 * ```
 */
export const cacheManager = new CacheManager()
