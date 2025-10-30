/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AdminSettings from '../page'
import { supabaseRest } from '@/services/supabaseRest'

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
    update: jest.fn(),
  },
}))

// Mock campgroundService
jest.mock('@/services', () => ({
  campgroundService: {
    getAll: jest.fn(() => []),
    update: jest.fn(),
  },
}))

// Mock getCampgroundInfo
jest.mock('../../../../lib/campground', () => ({
  getCampgroundInfo: jest.fn(() => ({
    id: 'test-campground-id',
    name: 'Test Campground',
    contactPhone: '010-1234-5678',
    contactEmail: 'test@example.com',
    address: 'Test Address',
    description: 'Test Description',
  })),
}))

// Mock QRCodeGenerator component
jest.mock('@/components/common', () => ({
  Card: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div data-testid="card">
      <h3>{title}</h3>
      {children}
    </div>
  ),
  QRCodeGenerator: () => <div data-testid="qr-code-generator">QR Code</div>,
}))

describe('AdminSettings - Charcoal Reservation Settings', () => {
  const mockSupabaseData = {
    id: 'campground-123',
    name: 'Test Campground',
    status: 'active',
    description: 'Welcome to our campground',
    guidelines: 'Rule 1\nRule 2',
    address: '123 Camp St',
    contact_phone: '010-1234-5678',
    contact_email: 'info@camp.com',
    enable_charcoal_reservation: true,
    charcoal_time_options: ['오후 6시', '오후 7시', '오후 8시', '오후 9시'],
  }

  beforeEach(() => {
    // Mock window.location.search
    window.location.search = '?campground=Test Campground&id=campground-123'

    // Reset all mocks
    jest.clearAllMocks()
    ;(supabaseRest.isEnabled as jest.Mock).mockReturnValue(true)
  })

  describe('Load charcoal settings on mount', () => {
    it('should load charcoal settings from Supabase on mount', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([mockSupabaseData])

      // Act
      render(<AdminSettings />)

      // Assert
      await waitFor(() => {
        expect(supabaseRest.select).toHaveBeenCalledWith(
          'campgrounds',
          expect.stringContaining('?id=eq.campground-123')
        )
      })
    })

    it('should set charcoal enabled state from Supabase data', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([mockSupabaseData])

      // Act
      render(<AdminSettings />)

      // Click charcoal tab
      const charcoalTab = await screen.findByText('🔥 숯불 예약 설정')
      fireEvent.click(charcoalTab)

      // Assert
      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox') as HTMLInputElement
        expect(checkbox.checked).toBe(true)
      })
    })

    it('should set charcoal time options from Supabase data', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([mockSupabaseData])

      // Act
      render(<AdminSettings />)

      // Click charcoal tab
      const charcoalTab = await screen.findByText('🔥 숯불 예약 설정')
      fireEvent.click(charcoalTab)

      // Assert
      await waitFor(() => {
        mockSupabaseData.charcoal_time_options.forEach((time) => {
          expect(screen.getByText(time)).toBeInTheDocument()
        })
      })
    })
  })

  describe('Toggle switch functionality', () => {
    it('should toggle charcoal enabled state when checkbox is clicked', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([
        { ...mockSupabaseData, enable_charcoal_reservation: false },
      ])

      render(<AdminSettings />)

      // Click charcoal tab
      const charcoalTab = await screen.findByText('🔥 숯불 예약 설정')
      fireEvent.click(charcoalTab)

      // Act
      const checkbox = (await screen.findByRole('checkbox')) as HTMLInputElement
      expect(checkbox.checked).toBe(false)

      fireEvent.click(checkbox)

      // Assert
      await waitFor(() => {
        expect(checkbox.checked).toBe(true)
      })
    })

    it('should hide time options when charcoal is disabled', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([
        { ...mockSupabaseData, enable_charcoal_reservation: false },
      ])

      render(<AdminSettings />)

      // Click charcoal tab
      const charcoalTab = await screen.findByText('🔥 숯불 예약 설정')
      fireEvent.click(charcoalTab)

      // Assert
      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox') as HTMLInputElement
        expect(checkbox.checked).toBe(false)
      })

      // Time options should not be visible
      expect(screen.queryByText('예약 가능 시간대')).not.toBeInTheDocument()
    })

    it('should show time options when charcoal is enabled', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([mockSupabaseData])

      render(<AdminSettings />)

      // Click charcoal tab
      const charcoalTab = await screen.findByText('🔥 숯불 예약 설정')
      fireEvent.click(charcoalTab)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('예약 가능 시간대')).toBeInTheDocument()
      })
    })
  })

  describe('Add new time option', () => {
    it('should add new time option when add button is clicked', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([mockSupabaseData])

      render(<AdminSettings />)

      // Click charcoal tab
      const charcoalTab = await screen.findByText('🔥 숯불 예약 설정')
      fireEvent.click(charcoalTab)

      // Act
      await waitFor(() => {
        expect(screen.getByText('예약 가능 시간대')).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText('예) 오후 10시')
      const addButton = screen.getByText('추가')

      fireEvent.change(input, { target: { value: '오후 10시' } })
      fireEvent.click(addButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('오후 10시')).toBeInTheDocument()
      })
    })

    it('should alert when trying to add empty time option', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([mockSupabaseData])
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

      render(<AdminSettings />)

      // Click charcoal tab
      const charcoalTab = await screen.findByText('🔥 숯불 예약 설정')
      fireEvent.click(charcoalTab)

      // Act
      await waitFor(() => {
        expect(screen.getByText('예약 가능 시간대')).toBeInTheDocument()
      })

      const addButton = screen.getByText('추가')
      fireEvent.click(addButton)

      // Assert
      expect(alertSpy).toHaveBeenCalledWith('시간대를 입력해주세요.')

      alertSpy.mockRestore()
    })

    it('should alert when trying to add duplicate time option', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([mockSupabaseData])
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

      render(<AdminSettings />)

      // Click charcoal tab
      const charcoalTab = await screen.findByText('🔥 숯불 예약 설정')
      fireEvent.click(charcoalTab)

      // Act
      await waitFor(() => {
        expect(screen.getByText('예약 가능 시간대')).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText('예) 오후 10시')
      const addButton = screen.getByText('추가')

      fireEvent.change(input, { target: { value: '오후 6시' } }) // Duplicate
      fireEvent.click(addButton)

      // Assert
      expect(alertSpy).toHaveBeenCalledWith('이미 존재하는 시간대입니다.')

      alertSpy.mockRestore()
    })

    it('should clear input after successfully adding time option', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([mockSupabaseData])

      render(<AdminSettings />)

      // Click charcoal tab
      const charcoalTab = await screen.findByText('🔥 숯불 예약 설정')
      fireEvent.click(charcoalTab)

      // Act
      await waitFor(() => {
        expect(screen.getByText('예약 가능 시간대')).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText('예) 오후 10시') as HTMLInputElement
      const addButton = screen.getByText('추가')

      fireEvent.change(input, { target: { value: '오후 10시' } })
      fireEvent.click(addButton)

      // Assert
      await waitFor(() => {
        expect(input.value).toBe('')
      })
    })
  })

  describe('Delete time option', () => {
    it('should delete time option when delete button is clicked', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([mockSupabaseData])

      render(<AdminSettings />)

      // Click charcoal tab
      const charcoalTab = await screen.findByText('🔥 숯불 예약 설정')
      fireEvent.click(charcoalTab)

      // Act
      await waitFor(() => {
        expect(screen.getByText('오후 6시')).toBeInTheDocument()
      })

      // Find the first delete button (×)
      const deleteButtons = screen.getAllByText('×')
      fireEvent.click(deleteButtons[0])

      // Assert
      await waitFor(() => {
        expect(screen.queryByText('오후 6시')).not.toBeInTheDocument()
      })
    })
  })

  describe('Save charcoal settings', () => {
    it('should call supabaseRest.update with correct payload when save button is clicked', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([mockSupabaseData])
      ;(supabaseRest.update as jest.Mock).mockResolvedValue({})

      render(<AdminSettings />)

      // Click charcoal tab
      const charcoalTab = await screen.findByText('🔥 숯불 예약 설정')
      fireEvent.click(charcoalTab)

      // Act
      await waitFor(() => {
        expect(screen.getByText('예약 가능 시간대')).toBeInTheDocument()
      })

      const saveButton = screen.getAllByText('💾 저장')[0]
      fireEvent.click(saveButton)

      // Assert
      await waitFor(() => {
        expect(supabaseRest.update).toHaveBeenCalledWith(
          'campgrounds',
          {
            enable_charcoal_reservation: true,
            charcoal_time_options: ['오후 6시', '오후 7시', '오후 8시', '오후 9시'],
          },
          '?id=eq.campground-123'
        )
      })
    })

    it('should show success toast after successful save', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([mockSupabaseData])
      ;(supabaseRest.update as jest.Mock).mockResolvedValue({})

      render(<AdminSettings />)

      // Click charcoal tab
      const charcoalTab = await screen.findByText('🔥 숯불 예약 설정')
      fireEvent.click(charcoalTab)

      // Act
      await waitFor(() => {
        expect(screen.getByText('예약 가능 시간대')).toBeInTheDocument()
      })

      const saveButton = screen.getAllByText('💾 저장')[0]
      fireEvent.click(saveButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('숯불 예약 설정이 저장되었습니다.')).toBeInTheDocument()
      })
    })

    it('should show error toast when save fails', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([mockSupabaseData])
      ;(supabaseRest.update as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(<AdminSettings />)

      // Click charcoal tab
      const charcoalTab = await screen.findByText('🔥 숯불 예약 설정')
      fireEvent.click(charcoalTab)

      // Act
      await waitFor(() => {
        expect(screen.getByText('예약 가능 시간대')).toBeInTheDocument()
      })

      const saveButton = screen.getAllByText('💾 저장')[0]
      fireEvent.click(saveButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('저장 중 오류가 발생했습니다.')).toBeInTheDocument()
      })
    })

    it('should show error toast when Supabase is not enabled', async () => {
      // Arrange
      ;(supabaseRest.isEnabled as jest.Mock).mockReturnValue(false)
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([])

      render(<AdminSettings />)

      // Click charcoal tab
      const charcoalTab = await screen.findByText('🔥 숯불 예약 설정')
      fireEvent.click(charcoalTab)

      // Act
      await waitFor(() => {
        const saveButton = screen.getAllByText('💾 저장')[0]
        fireEvent.click(saveButton)
      })

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Supabase가 활성화되지 않았습니다.')).toBeInTheDocument()
      })
    })

    it('should disable save button when campgroundId is not loaded', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([])

      render(<AdminSettings />)

      // Click charcoal tab
      const charcoalTab = await screen.findByText('🔥 숯불 예약 설정')
      fireEvent.click(charcoalTab)

      // Assert
      await waitFor(() => {
        const saveButtons = screen.getAllByText('💾 저장')
        expect(saveButtons[0]).toBeDisabled()
      })
    })
  })

  describe('Integration: add + save workflow', () => {
    it('should add time option and save successfully', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([mockSupabaseData])
      ;(supabaseRest.update as jest.Mock).mockResolvedValue({})

      render(<AdminSettings />)

      // Click charcoal tab
      const charcoalTab = await screen.findByText('🔥 숯불 예약 설정')
      fireEvent.click(charcoalTab)

      // Act - Add new time
      await waitFor(() => {
        expect(screen.getByText('예약 가능 시간대')).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText('예) 오후 10시')
      const addButton = screen.getByText('추가')

      fireEvent.change(input, { target: { value: '오후 10시' } })
      fireEvent.click(addButton)

      // Act - Save
      await waitFor(() => {
        expect(screen.getByText('오후 10시')).toBeInTheDocument()
      })

      const saveButton = screen.getAllByText('💾 저장')[0]
      fireEvent.click(saveButton)

      // Assert
      await waitFor(() => {
        expect(supabaseRest.update).toHaveBeenCalledWith(
          'campgrounds',
          {
            enable_charcoal_reservation: true,
            charcoal_time_options: ['오후 6시', '오후 7시', '오후 8시', '오후 9시', '오후 10시'],
          },
          '?id=eq.campground-123'
        )
      })
    })

    it('should delete time option and save successfully', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([mockSupabaseData])
      ;(supabaseRest.update as jest.Mock).mockResolvedValue({})

      render(<AdminSettings />)

      // Click charcoal tab
      const charcoalTab = await screen.findByText('🔥 숯불 예약 설정')
      fireEvent.click(charcoalTab)

      // Act - Delete first time option
      await waitFor(() => {
        expect(screen.getByText('오후 6시')).toBeInTheDocument()
      })

      const deleteButtons = screen.getAllByText('×')
      fireEvent.click(deleteButtons[0])

      // Act - Save
      await waitFor(() => {
        expect(screen.queryByText('오후 6시')).not.toBeInTheDocument()
      })

      const saveButton = screen.getAllByText('💾 저장')[0]
      fireEvent.click(saveButton)

      // Assert
      await waitFor(() => {
        expect(supabaseRest.update).toHaveBeenCalledWith(
          'campgrounds',
          {
            enable_charcoal_reservation: true,
            charcoal_time_options: ['오후 7시', '오후 8시', '오후 9시'],
          },
          '?id=eq.campground-123'
        )
      })
    })
  })
})

describe('AdminSettings - Cache Management', () => {
  const STORAGE_KEY = 'odoichon_campground_info'
  const mockSupabaseData = {
    id: 'campground-123',
    name: 'Test Campground',
    status: 'active',
    description: 'Welcome to our campground',
    guidelines: 'Rule 1\nRule 2',
    address: '123 Camp St',
    contact_phone: '010-1234-5678',
    contact_email: 'info@camp.com',
    enable_charcoal_reservation: true,
    charcoal_time_options: ['오후 6시', '오후 7시', '오후 8시', '오후 9시'],
  }

  beforeEach(() => {
    // Mock window.location.search
    window.location.search = '?campground=Test Campground&id=campground-123'

    // Reset all mocks
    jest.clearAllMocks()
    ;(supabaseRest.isEnabled as jest.Mock).mockReturnValue(true)
    ;(supabaseRest.select as jest.Mock).mockResolvedValue([mockSupabaseData])

    // Clear localStorage
    localStorage.clear()
  })

  describe('Tab navigation', () => {
    it('should display cache management tab content when clicked', async () => {
      // Arrange
      render(<AdminSettings />)

      // Act
      const cacheTab = await screen.findByText('🗑️ 캐시 관리')
      fireEvent.click(cacheTab)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('캐시 관리')).toBeInTheDocument()
        expect(screen.getByText('로컬 캐시란?')).toBeInTheDocument()
        expect(screen.getByText('🗑️ 로컬 캐시 삭제')).toBeInTheDocument()
      })
    })

    it('should show cache explanation text', async () => {
      // Arrange
      render(<AdminSettings />)

      // Act
      const cacheTab = await screen.findByText('🗑️ 캐시 관리')
      fireEvent.click(cacheTab)

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/브라우저에 저장된 캠핑장 정보 캐시입니다/i)
        ).toBeInTheDocument()
      })
    })
  })

  describe('Cache clear button click (user confirms)', () => {
    it('should clear localStorage when user confirms', async () => {
      // Arrange
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: 'test', name: 'Test' }))
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true)
      const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem')

      render(<AdminSettings />)

      // Act
      const cacheTab = await screen.findByText('🗑️ 캐시 관리')
      fireEvent.click(cacheTab)

      const clearButton = await screen.findByText('🗑️ 로컬 캐시 삭제')
      fireEvent.click(clearButton)

      // Assert
      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalledWith(
          '캐시를 삭제하시겠습니까? 저장된 캠핑장 정보가 초기화됩니다.'
        )
        expect(removeItemSpy).toHaveBeenCalledWith(STORAGE_KEY)
      })

      confirmSpy.mockRestore()
      removeItemSpy.mockRestore()
    })

    it('should show success toast after clearing cache', async () => {
      // Arrange
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: 'test', name: 'Test' }))
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true)

      render(<AdminSettings />)

      // Act
      const cacheTab = await screen.findByText('🗑️ 캐시 관리')
      fireEvent.click(cacheTab)

      const clearButton = await screen.findByText('🗑️ 로컬 캐시 삭제')
      fireEvent.click(clearButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText('캐시가 성공적으로 삭제되었습니다.')).toBeInTheDocument()
      })

      confirmSpy.mockRestore()
    })
  })

  describe('Cache clear button click (user cancels)', () => {
    it('should not clear localStorage when user cancels', async () => {
      // Arrange
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: 'test', name: 'Test' }))
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false)
      const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem')

      render(<AdminSettings />)

      // Act
      const cacheTab = await screen.findByText('🗑️ 캐시 관리')
      fireEvent.click(cacheTab)

      const clearButton = await screen.findByText('🗑️ 로컬 캐시 삭제')
      fireEvent.click(clearButton)

      // Assert
      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalled()
        expect(removeItemSpy).not.toHaveBeenCalled()
      })

      // No toast should appear
      expect(screen.queryByText('캐시가 성공적으로 삭제되었습니다.')).not.toBeInTheDocument()

      confirmSpy.mockRestore()
      removeItemSpy.mockRestore()
    })
  })

  describe('Cache clear error', () => {
    it('should show error toast when localStorage.removeItem throws error', async () => {
      // Arrange
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true)
      const removeItemSpy = jest
        .spyOn(Storage.prototype, 'removeItem')
        .mockImplementation(() => {
          throw new Error('Storage access denied')
        })
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      render(<AdminSettings />)

      // Act
      const cacheTab = await screen.findByText('🗑️ 캐시 관리')
      fireEvent.click(cacheTab)

      const clearButton = await screen.findByText('🗑️ 로컬 캐시 삭제')
      fireEvent.click(clearButton)

      // Assert
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to clear cache:',
          expect.any(Error)
        )
        expect(screen.getByText('캐시 삭제 중 오류가 발생했습니다.')).toBeInTheDocument()
      })

      confirmSpy.mockRestore()
      removeItemSpy.mockRestore()
      consoleErrorSpy.mockRestore()
    })
  })
})
