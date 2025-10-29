import { AppConfig } from '../types'
import { APP_CONFIG } from '../constants'

// 로컬 스토리지 관리
export class StorageManager {
  private static isClient(): boolean {
    return typeof window !== 'undefined'
  }

  static get<T>(key: string): T | null {
    if (!this.isClient()) return null
    
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Failed to get item from localStorage: ${key}`, error)
      return null
    }
  }

  static set<T>(key: string, value: T): void {
    if (!this.isClient()) return
    
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Failed to set item in localStorage: ${key}`, error)
    }
  }

  static remove(key: string): void {
    if (!this.isClient()) return
    
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Failed to remove item from localStorage: ${key}`, error)
    }
  }

  static clear(): void {
    if (!this.isClient()) return
    
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Failed to clear localStorage', error)
    }
  }
}

// 날짜 유틸리티
export class DateUtils {
  static formatDate(date: string | Date, format: 'ko' | 'iso' = 'ko'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (format === 'ko') {
      return dateObj.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    return dateObj.toISOString().split('T')[0]
  }

  static getToday(): string {
    return new Date().toISOString().split('T')[0]
  }

  static addDays(date: string | Date, days: number): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    dateObj.setDate(dateObj.getDate() + days)
    return dateObj.toISOString().split('T')[0]
  }

  static isToday(date: string | Date): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const today = new Date()
    return dateObj.toDateString() === today.toDateString()
  }
}

// 문자열 유틸리티
export class StringUtils {
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  static truncate(str: string, length: number): string {
    return str.length > length ? str.substring(0, length) + '...' : str
  }

  static slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  static formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
    }
    return phone
  }
}

// 폼 유효성 검사
export class ValidationUtils {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static validatePhone(phone: string): boolean {
    const phoneRegex = /^010-\d{4}-\d{4}$/
    return phoneRegex.test(phone)
  }

  static validateRequired(value: any): boolean {
    return value !== null && value !== undefined && value.toString().trim().length > 0
  }

  static validateMinLength(value: string, min: number): boolean {
    return value.length >= min
  }

  static validateMaxLength(value: string, max: number): boolean {
    return value.length <= max
  }

  static validateForm<T>(data: T, rules: Partial<Record<keyof T, (value: any) => boolean>>): Partial<Record<keyof T, string>> {
    const errors: Partial<Record<keyof T, string>> = {}
    
    Object.entries(rules).forEach(([key, validator]) => {
      const value = data[key as keyof T]
      if (!validator(value)) {
        errors[key as keyof T] = '유효하지 않은 값입니다.'
      }
    })
    
    return errors
  }
}

// URL 유틸리티
export class UrlUtils {
  static buildUrl(base: string, params: Record<string, string>): string {
    const url = new URL(base, window.location.origin)
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
    return url.toString()
  }

  static getUrlParams(): URLSearchParams {
    return new URLSearchParams(window.location.search)
  }

  static getParam(key: string): string | null {
    return this.getUrlParams().get(key)
  }

  static setParam(key: string, value: string): void {
    const url = new URL(window.location.href)
    url.searchParams.set(key, value)
    window.history.replaceState({}, '', url.toString())
  }
}

// 에러 처리
export class ErrorHandler {
  static handle(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }
    
    if (typeof error === 'string') {
      return error
    }
    
    return '알 수 없는 오류가 발생했습니다.'
  }

  static log(error: unknown, context?: string): void {
    const message = this.handle(error)
    console.error(`[${context || 'Error'}] ${message}`, error)
  }
}

// 디바운스 함수
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 쓰로틀 함수
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}
