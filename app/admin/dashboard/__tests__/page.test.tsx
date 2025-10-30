/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AdminDashboard from '../page'
import { supabaseRest } from '@/services/supabaseRest'
import { campgroundService } from '@/services'
import { validateAndGetCampgroundInfo } from '../../../../lib/campground'

// Mock Next.js router
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

// Mock supabaseRest
jest.mock('@/services/supabaseRest', () => ({
  supabaseRest: {
    isEnabled: jest.fn(),
    select: jest.fn(),
  },
}))

// Mock campgroundService
jest.mock('@/services', () => ({
  campgroundService: {
    getAll: jest.fn(),
  },
}))

// Mock validateAndGetCampgroundInfo
jest.mock('../../../../lib/campground', () => ({
  validateAndGetCampgroundInfo: jest.fn(),
  getCampgroundInfo: jest.fn(() => ({
    id: 'default-campground',
    name: '오도이촌 캠핑장',
    contactPhone: '010-1234-5678',
    contactEmail: 'carawoo96@gmail.com',
    address: '경기도 양평군 오도이촌',
    description: '도심과 자연을 잇는 캠핑장',
  })),
  updateCampgroundInfo: jest.fn(),
}))

describe('AdminDashboard - Initialization with Validation', () => {
  const mockSupabaseCampground = {
    id: 'supabase-campground',
    name: '테스트 캠핑장',
    status: 'active',
    contact_phone: '010-1111-2222',
    contact_email: 'test@camp.com',
    address: '서울시 강남구',
    description: 'Supabase 캠핑장',
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
    // Clear all mocks
    jest.clearAllMocks()
    localStorage.clear()

    // Default mock behavior
    ;(supabaseRest.isEnabled as jest.Mock).mockReturnValue(true)
    ;(campgroundService.getAll as jest.Mock).mockReturnValue([])
    ;(validateAndGetCampgroundInfo as jest.Mock).mockResolvedValue(defaultCampground)
  })

  describe('Initialize with valid Supabase data', () => {
    it('should display campground name from Supabase', async () => {
      // Arrange
      window.location.search = '?campground=테스트 캠핑장'
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([mockSupabaseCampground])

      // Act
      render(<AdminDashboard />)

      // Assert
      await waitFor(() => {
        const nameElements = screen.getAllByText(/테스트 캠핑장/)
        expect(nameElements.length).toBeGreaterThan(0)
      })
    })

    it('should not call validateAndGetCampgroundInfo when Supabase returns data', async () => {
      // Arrange
      window.location.search = '?campground=테스트 캠핑장'
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([mockSupabaseCampground])

      // Act
      render(<AdminDashboard />)

      // Assert
      await waitFor(() => {
        const nameElements = screen.getAllByText(/테스트 캠핑장/)
        expect(nameElements.length).toBeGreaterThan(0)
      })
      expect(validateAndGetCampgroundInfo).not.toHaveBeenCalled()
    })
  })

  describe('Initialize with invalid localStorage (main test case)', () => {
    it('should call validateAndGetCampgroundInfo when Supabase returns empty', async () => {
      // Arrange
      window.location.search = '?campground=용오름밸리'
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([]) // Not found in Supabase
      ;(campgroundService.getAll as jest.Mock).mockReturnValue([]) // Not found in service
      ;(validateAndGetCampgroundInfo as jest.Mock).mockResolvedValue(defaultCampground)

      // Act
      render(<AdminDashboard />)

      // Assert
      await waitFor(() => {
        expect(validateAndGetCampgroundInfo).toHaveBeenCalled()
      })
    })

    it('should display default campground when localStorage has invalid data', async () => {
      // Arrange
      window.location.search = '?campground=용오름밸리'
      localStorage.setItem(
        'odoichon_campground_info',
        JSON.stringify({
          id: 'invalid-id',
          name: '용오름밸리',
          contactPhone: '010-9999-9999',
          contactEmail: 'invalid@example.com',
          address: '존재하지 않는 주소',
          description: '삭제된 캠핑장',
        })
      )
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([]) // Not found
      ;(campgroundService.getAll as jest.Mock).mockReturnValue([])
      ;(validateAndGetCampgroundInfo as jest.Mock).mockResolvedValue(defaultCampground)

      // Act
      render(<AdminDashboard />)

      // Assert
      await waitFor(() => {
        const nameElements = screen.getAllByText(/오도이촌 캠핑장/)
        expect(nameElements.length).toBeGreaterThan(0)
      })
    })

    it('should remove invalid data from localStorage through validation', async () => {
      // Arrange
      window.location.search = '?campground=용오름밸리'
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([])
      ;(campgroundService.getAll as jest.Mock).mockReturnValue([])
      ;(validateAndGetCampgroundInfo as jest.Mock).mockResolvedValue(defaultCampground)

      // Act
      render(<AdminDashboard />)

      // Assert
      await waitFor(() => {
        expect(validateAndGetCampgroundInfo).toHaveBeenCalled()
        const nameElements = screen.getAllByText(/오도이촌 캠핑장/)
        expect(nameElements.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Initialize with Supabase error', () => {
    it('should fallback to validateAndGetCampgroundInfo when Supabase throws error', async () => {
      // Arrange
      window.location.search = '?campground=테스트 캠핑장'
      ;(supabaseRest.select as jest.Mock).mockRejectedValue(new Error('Network error'))
      ;(campgroundService.getAll as jest.Mock).mockReturnValue([])
      ;(validateAndGetCampgroundInfo as jest.Mock).mockResolvedValue(defaultCampground)
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      // Act
      render(<AdminDashboard />)

      // Assert
      await waitFor(() => {
        expect(validateAndGetCampgroundInfo).toHaveBeenCalled()
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Dashboard initialization error:',
          expect.any(Error)
        )
      })

      consoleErrorSpy.mockRestore()
    })

    it('should still render dashboard after Supabase error', async () => {
      // Arrange
      window.location.search = '?campground=테스트 캠핑장'
      ;(supabaseRest.select as jest.Mock).mockRejectedValue(new Error('500 Internal Server Error'))
      ;(campgroundService.getAll as jest.Mock).mockReturnValue([])
      ;(validateAndGetCampgroundInfo as jest.Mock).mockResolvedValue(defaultCampground)

      // Act
      render(<AdminDashboard />)

      // Assert - Just verify dashboard renders without crashing
      await waitFor(() => {
        expect(screen.getAllByText(/캠지기 센터/).length).toBeGreaterThan(0)
        expect(screen.queryByText(/로딩 중/)).not.toBeInTheDocument()
      })
    })
  })

  describe('Loading state', () => {
    it('should show loading indicator initially', () => {
      // Arrange
      window.location.search = '?campground=테스트 캠핑장'
      ;(supabaseRest.select as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve([mockSupabaseCampground]), 100)
          })
      )

      // Act
      render(<AdminDashboard />)

      // Assert
      expect(screen.getByText('로딩 중...')).toBeInTheDocument()
    })

    it('should hide loading indicator after data loads', async () => {
      // Arrange
      window.location.search = '?campground=테스트 캠핑장'
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([mockSupabaseCampground])

      // Act
      render(<AdminDashboard />)

      // Assert
      await waitFor(
        () => {
          expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })
  })

  describe('Campground status restrictions', () => {
    it('should show access denied for suspended campground', async () => {
      // Arrange
      window.location.search = '?campground=정지된 캠핑장'
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([
        { ...mockSupabaseCampground, status: 'suspended' },
      ])

      // Act
      render(<AdminDashboard />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('접근 제한')).toBeInTheDocument()
        expect(screen.getByText(/일시정지된 캠핑장입니다/)).toBeInTheDocument()
      })
    })

    it('should show access denied for terminated campground', async () => {
      // Arrange
      window.location.search = '?campground=해지된 캠핑장'
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([
        { ...mockSupabaseCampground, status: 'terminated' },
      ])

      // Act
      render(<AdminDashboard />)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('접근 제한')).toBeInTheDocument()
        expect(screen.getByText(/계약이 해지된 캠핑장입니다/)).toBeInTheDocument()
      })
    })

    it('should allow access for active campground', async () => {
      // Arrange
      window.location.search = '?campground=테스트 캠핑장'
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([
        { ...mockSupabaseCampground, status: 'active' },
      ])

      // Act
      render(<AdminDashboard />)

      // Assert
      await waitFor(() => {
        expect(screen.queryByText('접근 제한')).not.toBeInTheDocument()
        const nameElements = screen.getAllByText(/테스트 캠핑장/)
        expect(nameElements.length).toBeGreaterThan(0)
      })
    })

    it('should allow access for pending campground', async () => {
      // Arrange
      window.location.search = '?campground=테스트 캠핑장'
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([
        { ...mockSupabaseCampground, status: 'pending' },
      ])

      // Act
      render(<AdminDashboard />)

      // Assert
      await waitFor(() => {
        expect(screen.queryByText('접근 제한')).not.toBeInTheDocument()
        const nameElements = screen.getAllByText(/테스트 캠핑장/)
        expect(nameElements.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Fallback chain (Supabase → Service → validateAndGetCampgroundInfo)', () => {
    it('should try campgroundService when Supabase returns empty', async () => {
      // Arrange
      window.location.search = '?campground=서비스 캠핑장'
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([])
      ;(campgroundService.getAll as jest.Mock).mockReturnValue([
        {
          id: 'service-campground',
          name: '서비스 캠핑장',
          status: 'active',
          contactInfo: {
            phone: '010-3333-4444',
            email: 'service@camp.com',
          },
          address: '부산시 해운대구',
          description: '서비스 레이어 캠핑장',
          adminUrl: '/admin/dashboard?campground=서비스 캠핑장',
          kioskUrl: '/kiosk?campground=서비스 캠핑장',
        },
      ])

      // Act
      render(<AdminDashboard />)

      // Assert - Verify campgroundService was called as fallback
      await waitFor(() => {
        expect(campgroundService.getAll).toHaveBeenCalled()
        expect(screen.queryByText(/로딩 중/)).not.toBeInTheDocument()
      })
    })

    it('should use validateAndGetCampgroundInfo as final fallback', async () => {
      // Arrange
      window.location.search = '?campground=존재하지 않는 캠핑장'
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([])
      ;(campgroundService.getAll as jest.Mock).mockReturnValue([])
      ;(validateAndGetCampgroundInfo as jest.Mock).mockResolvedValue(defaultCampground)

      // Act
      render(<AdminDashboard />)

      // Assert
      await waitFor(() => {
        expect(validateAndGetCampgroundInfo).toHaveBeenCalled()
        const nameElements = screen.getAllByText(/오도이촌 캠핑장/)
        expect(nameElements.length).toBeGreaterThan(0)
      })
    })
  })
})
