/**
 * @jest-environment jsdom
 */

import { validateAndGetCampgroundInfo, getCampgroundInfo } from '../campground'
import { supabaseRest } from '@/services/supabaseRest'

// Mock supabaseRest
jest.mock('@/services/supabaseRest', () => ({
  supabaseRest: {
    isEnabled: jest.fn(),
    select: jest.fn(),
  },
}))

describe('validateAndGetCampgroundInfo', () => {
  const STORAGE_KEY = 'odoichon_campground_info'
  const validCampground = {
    id: 'test-campground',
    name: '테스트 캠핑장',
    contactPhone: '010-1234-5678',
    contactEmail: 'test@example.com',
    address: '서울시 강남구',
    description: '테스트 캠핑장입니다',
  }

  const defaultCampground = {
    id: 'odoichon',
    name: '오도이촌 캠핑장',
    contactPhone: '010-1234-5678',
    contactEmail: 'carawoo96@gmail.com',
    address: '경기도 양평군 오도이촌',
    description: '도심과 자연을 잇는 캠핑장',
  }

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('Valid campground data (exists in Supabase)', () => {
    it('should return campground data from localStorage when it exists in Supabase', async () => {
      // Arrange
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validCampground))
      ;(supabaseRest.isEnabled as jest.Mock).mockReturnValue(true)
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([
        { id: 'test-campground', name: '테스트 캠핑장' },
      ])

      // Act
      const result = await validateAndGetCampgroundInfo()

      // Assert
      expect(result).toEqual(validCampground)
      expect(supabaseRest.select).toHaveBeenCalledWith(
        'campgrounds',
        expect.stringContaining('?id=eq.test-campground')
      )
      expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy()
    })
  })

  describe('Invalid campground data (not in Supabase)', () => {
    it('should remove invalid data from localStorage and return default campground', async () => {
      // Arrange
      const invalidCampground = {
        id: 'invalid-id',
        name: '용오름밸리',
        contactPhone: '010-9999-9999',
        contactEmail: 'invalid@example.com',
        address: '존재하지 않는 주소',
        description: '삭제된 캠핑장',
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalidCampground))
      ;(supabaseRest.isEnabled as jest.Mock).mockReturnValue(true)
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([]) // Empty array = not found

      // Spy on console.warn
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

      // Act
      const result = await validateAndGetCampgroundInfo()

      // Assert
      expect(result).toEqual(defaultCampground)
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[validateAndGetCampgroundInfo] Removing invalid campground data')
      )
      expect(localStorage.getItem(STORAGE_KEY)).toEqual(JSON.stringify(defaultCampground))

      consoleWarnSpy.mockRestore()
    })

    it('should call localStorage.removeItem when campground not found in DB', async () => {
      // Arrange
      const invalidCampground = { ...validCampground, id: 'invalid-id' }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalidCampground))
      ;(supabaseRest.isEnabled as jest.Mock).mockReturnValue(true)
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([])

      const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem')

      // Act
      await validateAndGetCampgroundInfo()

      // Assert
      expect(removeItemSpy).toHaveBeenCalledWith(STORAGE_KEY)

      removeItemSpy.mockRestore()
    })
  })

  describe('Supabase disabled', () => {
    it('should return localStorage data without validation when Supabase is disabled', async () => {
      // Arrange
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validCampground))
      ;(supabaseRest.isEnabled as jest.Mock).mockReturnValue(false)

      // Act
      const result = await validateAndGetCampgroundInfo()

      // Assert
      expect(result).toEqual(validCampground)
      expect(supabaseRest.select).not.toHaveBeenCalled()
      expect(localStorage.getItem(STORAGE_KEY)).toEqual(JSON.stringify(validCampground))
    })
  })

  describe('Supabase error (network failure)', () => {
    it('should gracefully degrade and return localStorage data when Supabase throws error', async () => {
      // Arrange
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validCampground))
      ;(supabaseRest.isEnabled as jest.Mock).mockReturnValue(true)
      ;(supabaseRest.select as jest.Mock).mockRejectedValue(new Error('Network error'))

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

      // Act
      const result = await validateAndGetCampgroundInfo()

      // Assert
      expect(result).toEqual(validCampground)
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[validateAndGetCampgroundInfo] Supabase validation failed'),
        expect.any(Error)
      )
      expect(localStorage.getItem(STORAGE_KEY)).toEqual(JSON.stringify(validCampground))

      consoleWarnSpy.mockRestore()
    })

    it('should not remove data from localStorage on Supabase error', async () => {
      // Arrange
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validCampground))
      ;(supabaseRest.isEnabled as jest.Mock).mockReturnValue(true)
      ;(supabaseRest.select as jest.Mock).mockRejectedValue(new Error('500 Internal Server Error'))

      const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem')

      // Act
      await validateAndGetCampgroundInfo()

      // Assert
      expect(removeItemSpy).not.toHaveBeenCalled()

      removeItemSpy.mockRestore()
    })
  })

  describe('Empty localStorage', () => {
    it('should return default campground when localStorage is empty', async () => {
      // Arrange
      ;(supabaseRest.isEnabled as jest.Mock).mockReturnValue(true)

      // Act
      const result = await validateAndGetCampgroundInfo()

      // Assert
      expect(result).toEqual(defaultCampground)
      expect(localStorage.getItem(STORAGE_KEY)).toEqual(JSON.stringify(defaultCampground))
    })

    it('should not call Supabase when localStorage is empty', async () => {
      // Arrange
      ;(supabaseRest.isEnabled as jest.Mock).mockReturnValue(true)

      // Act
      await validateAndGetCampgroundInfo()

      // Assert
      expect(supabaseRest.select).not.toHaveBeenCalled()
    })
  })

  describe('Server-side rendering (window undefined)', () => {
    it('should return default campground when window is undefined', async () => {
      // Arrange
      const originalWindow = global.window
      // @ts-expect-error: Testing SSR behavior
      delete global.window

      // Act
      const result = await validateAndGetCampgroundInfo()

      // Assert
      expect(result).toEqual(defaultCampground)

      // Restore
      global.window = originalWindow
    })
  })

  describe('JSON parsing errors', () => {
    it('should handle corrupted localStorage data gracefully', async () => {
      // Arrange
      localStorage.setItem(STORAGE_KEY, 'invalid json {{{')
      ;(supabaseRest.isEnabled as jest.Mock).mockReturnValue(true)

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      // Act
      const result = await validateAndGetCampgroundInfo()

      // Assert
      expect(result).toEqual(defaultCampground)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[validateAndGetCampgroundInfo] Failed to validate campground info'),
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })
  })
})

describe('getCampgroundInfo (synchronous)', () => {
  const STORAGE_KEY = 'odoichon_campground_info'
  const validCampground = {
    id: 'test-campground',
    name: '테스트 캠핑장',
    contactPhone: '010-1234-5678',
    contactEmail: 'test@example.com',
    address: '서울시 강남구',
    description: '테스트 캠핑장입니다',
  }

  const defaultCampground = {
    id: 'odoichon',
    name: '오도이촌 캠핑장',
    contactPhone: '010-1234-5678',
    contactEmail: 'carawoo96@gmail.com',
    address: '경기도 양평군 오도이촌',
    description: '도심과 자연을 잇는 캠핑장',
  }

  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should return stored campground info from localStorage', () => {
    // Arrange
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validCampground))

    // Act
    const result = getCampgroundInfo()

    // Assert
    expect(result).toEqual(validCampground)
  })

  it('should return default campground when localStorage is empty', () => {
    // Act
    const result = getCampgroundInfo()

    // Assert
    expect(result).toEqual(defaultCampground)
    expect(localStorage.getItem(STORAGE_KEY)).toEqual(JSON.stringify(defaultCampground))
  })

  it('should not perform async validation', () => {
    // Arrange
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validCampground))

    // Act
    const result = getCampgroundInfo()

    // Assert
    expect(supabaseRest.select).not.toHaveBeenCalled()
    expect(result).toEqual(validCampground)
  })
})
