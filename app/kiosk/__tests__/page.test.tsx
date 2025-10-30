/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import CheckInKiosk from '../page'
import { supabaseRest } from '@/services/supabaseRest'

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
  },
}))

// Mock reservations lib
jest.mock('../../../lib/reservations', () => ({
  getReservations: jest.fn(() => []),
  findReservation: jest.fn(),
  updateReservationStatus: jest.fn(),
}))

// Mock getCampgroundInfo
jest.mock('../../../lib/campground', () => ({
  getCampgroundInfo: jest.fn(() => ({
    id: 'test-campground-id',
    name: 'Test Campground',
    contactPhone: '010-1234-5678',
    contactEmail: 'test@example.com',
    address: 'Test Address',
    description: 'Welcome to our campground',
  })),
}))

describe('CheckInKiosk - Charcoal Reservation Feature', () => {
  const mockCampgroundData = {
    id: 'campground-123',
    name: 'Test Campground',
    status: 'active',
    contact_phone: '010-1234-5678',
    contact_email: 'info@camp.com',
    address: '123 Camp St',
    description: 'Welcome',
    guidelines: 'Rule 1\nRule 2',
    enable_charcoal_reservation: true,
    charcoal_time_options: ['오후 6시', '오후 7시', '오후 8시', '오후 9시'],
  }

  const mockReservationData = {
    id: 'reservation-123',
    guest_name: 'John Doe',
    phone: '010-1234-5678',
    room_number: 'A-101',
    check_in_date: new Date().toISOString().split('T')[0],
    check_out_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    guests: 2,
    total_amount: 100000,
    status: 'confirmed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  beforeEach(() => {
    // Mock window.location.search
    window.location.search = '?campground=Test Campground&id=campground-123'

    // Reset all mocks
    jest.clearAllMocks()
    ;(supabaseRest.isEnabled as jest.Mock).mockReturnValue(true)

    // Mock fetch for checkin notification
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })
  })

  describe('Load charcoal settings on mount', () => {
    it('should load charcoal settings from Supabase on mount', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([mockCampgroundData])

      // Act
      render(<CheckInKiosk />)

      // Assert
      await waitFor(() => {
        expect(supabaseRest.select).toHaveBeenCalledWith(
          'campgrounds',
          expect.stringContaining('?id=eq.')
        )
      })
    })

    it('should set charcoalEnabled state from Supabase data', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([mockCampgroundData])

      // Act
      render(<CheckInKiosk />)

      // Assert - Verify state was set (we'll check behavior in later tests)
      await waitFor(() => {
        expect(supabaseRest.select).toHaveBeenCalled()
      })
    })

    it('should set charcoalTimeOptions state from Supabase data', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockResolvedValue([mockCampgroundData])

      // Act
      render(<CheckInKiosk />)

      // Assert
      await waitFor(() => {
        expect(supabaseRest.select).toHaveBeenCalled()
      })
    })
  })

  describe('Show charcoal modal after checkin', () => {
    it('should show charcoal selection modal after successful checkin when enabled=true', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockImplementation((table: string) => {
        if (table === 'campgrounds') return Promise.resolve([mockCampgroundData])
        if (table === 'reservations') return Promise.resolve([mockReservationData])
        return Promise.resolve([])
      })
      ;(supabaseRest.update as jest.Mock).mockResolvedValue({})

      render(<CheckInKiosk />)

      // Fill in search form
      await waitFor(() => {
        expect(screen.getByPlaceholderText('예약자 이름을 입력하세요')).toBeInTheDocument()
      })

      const nameInput = screen.getByPlaceholderText('예약자 이름을 입력하세요')
      const phoneInput = screen.getByPlaceholderText(/연락처를 입력하세요/)

      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(phoneInput, { target: { value: '010-1234-5678' } })

      const searchButton = screen.getByText('예약 확인')
      fireEvent.click(searchButton)

      // Wait for confirm screen
      await waitFor(() => {
        expect(screen.getByText('체크인 정보 확인')).toBeInTheDocument()
      })

      // Act - Click checkin button
      const checkinButton = screen.getByText('체크인 완료')
      fireEvent.click(checkinButton)

      // Assert - Charcoal modal should appear
      await waitFor(() => {
        expect(screen.getByText('🔥 숯불 예약 시간 선택')).toBeInTheDocument()
      })
    })

    it('should NOT show charcoal modal when enabled=false', async () => {
      // Arrange
      const disabledCharcoalData = {
        ...mockCampgroundData,
        enable_charcoal_reservation: false,
      }
      ;(supabaseRest.select as jest.Mock).mockImplementation((table: string) => {
        if (table === 'campgrounds') return Promise.resolve([disabledCharcoalData])
        if (table === 'reservations') return Promise.resolve([mockReservationData])
        return Promise.resolve([])
      })
      ;(supabaseRest.update as jest.Mock).mockResolvedValue({})

      render(<CheckInKiosk />)

      // Fill in search form
      await waitFor(() => {
        expect(screen.getByPlaceholderText('예약자 이름을 입력하세요')).toBeInTheDocument()
      })

      const nameInput = screen.getByPlaceholderText('예약자 이름을 입력하세요')
      const phoneInput = screen.getByPlaceholderText(/연락처를 입력하세요/)

      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(phoneInput, { target: { value: '010-1234-5678' } })

      const searchButton = screen.getByText('예약 확인')
      fireEvent.click(searchButton)

      // Wait for confirm screen
      await waitFor(() => {
        expect(screen.getByText('체크인 정보 확인')).toBeInTheDocument()
      })

      // Act - Click checkin button
      const checkinButton = screen.getByText('체크인 완료')
      fireEvent.click(checkinButton)

      // Assert - Charcoal modal should NOT appear, success modal should appear instead
      await waitFor(() => {
        expect(screen.queryByText('🔥 숯불 예약 시간 선택')).not.toBeInTheDocument()
        // Success modal appears when clicking "체크인 정보 보기"
        expect(screen.getByText('체크인 정보 보기')).toBeInTheDocument()
      })
    })

    it('should NOT show charcoal modal when time options are empty', async () => {
      // Arrange
      const emptyOptionsData = {
        ...mockCampgroundData,
        charcoal_time_options: [],
      }
      ;(supabaseRest.select as jest.Mock).mockImplementation((table: string) => {
        if (table === 'campgrounds') return Promise.resolve([emptyOptionsData])
        if (table === 'reservations') return Promise.resolve([mockReservationData])
        return Promise.resolve([])
      })
      ;(supabaseRest.update as jest.Mock).mockResolvedValue({})

      render(<CheckInKiosk />)

      // Fill in and submit form
      await waitFor(() => {
        expect(screen.getByPlaceholderText('예약자 이름을 입력하세요')).toBeInTheDocument()
      })

      const nameInput = screen.getByPlaceholderText('예약자 이름을 입력하세요')
      const phoneInput = screen.getByPlaceholderText(/연락처를 입력하세요/)

      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(phoneInput, { target: { value: '010-1234-5678' } })

      fireEvent.click(screen.getByText('예약 확인'))

      await waitFor(() => {
        expect(screen.getByText('체크인 정보 확인')).toBeInTheDocument()
      })

      const checkinButton = screen.getByText('체크인 완료')
      fireEvent.click(checkinButton)

      // Assert
      await waitFor(() => {
        expect(screen.queryByText('🔥 숯불 예약 시간 선택')).not.toBeInTheDocument()
      })
    })
  })

  describe('Charcoal modal - dropdown functionality', () => {
    it('should display all time options in dropdown', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockImplementation((table: string) => {
        if (table === 'campgrounds') return Promise.resolve([mockCampgroundData])
        if (table === 'reservations') return Promise.resolve([mockReservationData])
        return Promise.resolve([])
      })
      ;(supabaseRest.update as jest.Mock).mockResolvedValue({})

      render(<CheckInKiosk />)

      // Complete checkin flow
      await waitFor(() => {
        expect(screen.getByPlaceholderText('예약자 이름을 입력하세요')).toBeInTheDocument()
      })

      const nameInput = screen.getByPlaceholderText('예약자 이름을 입력하세요')
      const phoneInput = screen.getByPlaceholderText(/연락처를 입력하세요/)

      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(phoneInput, { target: { value: '010-1234-5678' } })
      fireEvent.click(screen.getByText('예약 확인'))

      await waitFor(() => {
        expect(screen.getByText('체크인 정보 확인')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('체크인 완료'))

      // Assert - Check dropdown options
      await waitFor(() => {
        const select = screen.getByRole('combobox') as HTMLSelectElement
        expect(select).toBeInTheDocument()

        // Check all options are present
        mockCampgroundData.charcoal_time_options.forEach((option) => {
          expect(screen.getByRole('option', { name: option })).toBeInTheDocument()
        })
      })
    })

    it('should update selected time when dropdown value changes', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockImplementation((table: string) => {
        if (table === 'campgrounds') return Promise.resolve([mockCampgroundData])
        if (table === 'reservations') return Promise.resolve([mockReservationData])
        return Promise.resolve([])
      })
      ;(supabaseRest.update as jest.Mock).mockResolvedValue({})

      render(<CheckInKiosk />)

      // Complete checkin flow
      await waitFor(() => {
        expect(screen.getByPlaceholderText('예약자 이름을 입력하세요')).toBeInTheDocument()
      })

      const nameInput = screen.getByPlaceholderText('예약자 이름을 입력하세요')
      const phoneInput = screen.getByPlaceholderText(/연락처를 입력하세요/)

      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(phoneInput, { target: { value: '010-1234-5678' } })
      fireEvent.click(screen.getByText('예약 확인'))

      await waitFor(() => {
        expect(screen.getByText('체크인 정보 확인')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('체크인 완료'))

      // Act - Select a time
      await waitFor(() => {
        const select = screen.getByRole('combobox')
        fireEvent.change(select, { target: { value: '오후 7시' } })
      })

      // Assert - Confirm button should be enabled
      const confirmButton = screen.getByText('선택 완료')
      expect(confirmButton).not.toBeDisabled()
    })
  })

  describe('Charcoal modal - skip button', () => {
    it('should close charcoal modal and show success modal when skip is clicked', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockImplementation((table: string) => {
        if (table === 'campgrounds') return Promise.resolve([mockCampgroundData])
        if (table === 'reservations') return Promise.resolve([mockReservationData])
        return Promise.resolve([])
      })
      ;(supabaseRest.update as jest.Mock).mockResolvedValue({})

      render(<CheckInKiosk />)

      // Complete checkin flow
      await waitFor(() => {
        expect(screen.getByPlaceholderText('예약자 이름을 입력하세요')).toBeInTheDocument()
      })

      const nameInput = screen.getByPlaceholderText('예약자 이름을 입력하세요')
      const phoneInput = screen.getByPlaceholderText(/연락처를 입력하세요/)

      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(phoneInput, { target: { value: '010-1234-5678' } })
      fireEvent.click(screen.getByText('예약 확인'))

      await waitFor(() => {
        expect(screen.getByText('체크인 정보 확인')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('체크인 완료'))

      // Act - Click skip button
      await waitFor(() => {
        expect(screen.getByText('건너뛰기')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('건너뛰기'))

      // Assert - Success modal should appear, charcoal modal should disappear
      await waitFor(() => {
        expect(screen.queryByText('🔥 숯불 예약 시간 선택')).not.toBeInTheDocument()
        expect(screen.getByText('체크인 정보 보기')).toBeInTheDocument()
      })
    })

    it('should NOT save charcoal time to Supabase when skip is clicked', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockImplementation((table: string) => {
        if (table === 'campgrounds') return Promise.resolve([mockCampgroundData])
        if (table === 'reservations') return Promise.resolve([mockReservationData])
        return Promise.resolve([])
      })
      ;(supabaseRest.update as jest.Mock).mockResolvedValue({})

      render(<CheckInKiosk />)

      // Complete checkin flow
      await waitFor(() => {
        expect(screen.getByPlaceholderText('예약자 이름을 입력하세요')).toBeInTheDocument()
      })

      const nameInput = screen.getByPlaceholderText('예약자 이름을 입력하세요')
      const phoneInput = screen.getByPlaceholderText(/연락처를 입력하세요/)

      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(phoneInput, { target: { value: '010-1234-5678' } })
      fireEvent.click(screen.getByText('예약 확인'))

      await waitFor(() => {
        expect(screen.getByText('체크인 정보 확인')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('체크인 완료'))

      // Clear previous update calls
      ;(supabaseRest.update as jest.Mock).mockClear()

      // Act - Click skip
      await waitFor(() => {
        expect(screen.getByText('건너뛰기')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('건너뛰기'))

      // Assert - No additional update call for charcoal_reservation_time
      await waitFor(() => {
        // Only the checkin update should have been called, not the charcoal update
        const charcoalUpdateCalls = (supabaseRest.update as jest.Mock).mock.calls.filter(
          (call) => call[1].charcoal_reservation_time !== undefined
        )
        expect(charcoalUpdateCalls.length).toBe(0)
      })
    })
  })

  describe('Charcoal modal - confirm button', () => {
    it('should be disabled when no time is selected', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockImplementation((table: string) => {
        if (table === 'campgrounds') return Promise.resolve([mockCampgroundData])
        if (table === 'reservations') return Promise.resolve([mockReservationData])
        return Promise.resolve([])
      })
      ;(supabaseRest.update as jest.Mock).mockResolvedValue({})

      render(<CheckInKiosk />)

      // Complete checkin flow
      await waitFor(() => {
        expect(screen.getByPlaceholderText('예약자 이름을 입력하세요')).toBeInTheDocument()
      })

      const nameInput = screen.getByPlaceholderText('예약자 이름을 입력하세요')
      const phoneInput = screen.getByPlaceholderText(/연락처를 입력하세요/)

      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(phoneInput, { target: { value: '010-1234-5678' } })
      fireEvent.click(screen.getByText('예약 확인'))

      await waitFor(() => {
        expect(screen.getByText('체크인 정보 확인')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('체크인 완료'))

      // Assert
      await waitFor(() => {
        const confirmButton = screen.getByText('선택 완료')
        expect(confirmButton).toBeDisabled()
      })
    })

    it('should save selected time to Supabase when confirm is clicked', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockImplementation((table: string) => {
        if (table === 'campgrounds') return Promise.resolve([mockCampgroundData])
        if (table === 'reservations') return Promise.resolve([mockReservationData])
        return Promise.resolve([])
      })
      ;(supabaseRest.update as jest.Mock).mockResolvedValue({})

      render(<CheckInKiosk />)

      // Complete checkin flow
      await waitFor(() => {
        expect(screen.getByPlaceholderText('예약자 이름을 입력하세요')).toBeInTheDocument()
      })

      const nameInput = screen.getByPlaceholderText('예약자 이름을 입력하세요')
      const phoneInput = screen.getByPlaceholderText(/연락처를 입력하세요/)

      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(phoneInput, { target: { value: '010-1234-5678' } })
      fireEvent.click(screen.getByText('예약 확인'))

      await waitFor(() => {
        expect(screen.getByText('체크인 정보 확인')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('체크인 완료'))

      // Clear previous update calls
      ;(supabaseRest.update as jest.Mock).mockClear()

      // Act - Select time and confirm
      await waitFor(() => {
        const select = screen.getByRole('combobox')
        fireEvent.change(select, { target: { value: '오후 7시' } })
      })

      fireEvent.click(screen.getByText('선택 완료'))

      // Assert - Check Supabase update was called with correct data
      await waitFor(() => {
        expect(supabaseRest.update).toHaveBeenCalledWith(
          'reservations',
          {
            charcoal_reservation_time: '오후 7시',
          },
          expect.stringContaining('?id=eq.reservation-123')
        )
      })
    })

    it('should close charcoal modal and show success modal after confirm', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockImplementation((table: string) => {
        if (table === 'campgrounds') return Promise.resolve([mockCampgroundData])
        if (table === 'reservations') return Promise.resolve([mockReservationData])
        return Promise.resolve([])
      })
      ;(supabaseRest.update as jest.Mock).mockResolvedValue({})

      render(<CheckInKiosk />)

      // Complete checkin flow
      await waitFor(() => {
        expect(screen.getByPlaceholderText('예약자 이름을 입력하세요')).toBeInTheDocument()
      })

      const nameInput = screen.getByPlaceholderText('예약자 이름을 입력하세요')
      const phoneInput = screen.getByPlaceholderText(/연락처를 입력하세요/)

      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(phoneInput, { target: { value: '010-1234-5678' } })
      fireEvent.click(screen.getByText('예약 확인'))

      await waitFor(() => {
        expect(screen.getByText('체크인 정보 확인')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('체크인 완료'))

      // Act - Select and confirm
      await waitFor(() => {
        const select = screen.getByRole('combobox')
        fireEvent.change(select, { target: { value: '오후 7시' } })
      })

      fireEvent.click(screen.getByText('선택 완료'))

      // Assert
      await waitFor(() => {
        expect(screen.queryByText('🔥 숯불 예약 시간 선택')).not.toBeInTheDocument()
        expect(screen.getByText('체크인 정보 보기')).toBeInTheDocument()
      })
    })

    it('should continue to success modal even if Supabase save fails', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockImplementation((table: string) => {
        if (table === 'campgrounds') return Promise.resolve([mockCampgroundData])
        if (table === 'reservations') return Promise.resolve([mockReservationData])
        return Promise.resolve([])
      })

      let updateCallCount = 0
      ;(supabaseRest.update as jest.Mock).mockImplementation(() => {
        updateCallCount++
        // First call (checkin) succeeds, second call (charcoal) fails
        if (updateCallCount === 1) return Promise.resolve({})
        return Promise.reject(new Error('Network error'))
      })

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      render(<CheckInKiosk />)

      // Complete checkin flow
      await waitFor(() => {
        expect(screen.getByPlaceholderText('예약자 이름을 입력하세요')).toBeInTheDocument()
      })

      const nameInput = screen.getByPlaceholderText('예약자 이름을 입력하세요')
      const phoneInput = screen.getByPlaceholderText(/연락처를 입력하세요/)

      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(phoneInput, { target: { value: '010-1234-5678' } })
      fireEvent.click(screen.getByText('예약 확인'))

      await waitFor(() => {
        expect(screen.getByText('체크인 정보 확인')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('체크인 완료'))

      // Act - Select and confirm
      await waitFor(() => {
        const select = screen.getByRole('combobox')
        fireEvent.change(select, { target: { value: '오후 7시' } })
      })

      fireEvent.click(screen.getByText('선택 완료'))

      // Assert - Should still show success modal (fail gracefully)
      await waitFor(() => {
        expect(screen.queryByText('🔥 숯불 예약 시간 선택')).not.toBeInTheDocument()
        expect(screen.getByText('체크인 정보 보기')).toBeInTheDocument()
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Success modal - display selected charcoal time', () => {
    it('should display selected charcoal time in success modal', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockImplementation((table: string) => {
        if (table === 'campgrounds') return Promise.resolve([mockCampgroundData])
        if (table === 'reservations') return Promise.resolve([mockReservationData])
        return Promise.resolve([])
      })
      ;(supabaseRest.update as jest.Mock).mockResolvedValue({})

      render(<CheckInKiosk />)

      // Complete checkin flow with charcoal selection
      await waitFor(() => {
        expect(screen.getByPlaceholderText('예약자 이름을 입력하세요')).toBeInTheDocument()
      })

      const nameInput = screen.getByPlaceholderText('예약자 이름을 입력하세요')
      const phoneInput = screen.getByPlaceholderText(/연락처를 입력하세요/)

      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(phoneInput, { target: { value: '010-1234-5678' } })
      fireEvent.click(screen.getByText('예약 확인'))

      await waitFor(() => {
        expect(screen.getByText('체크인 정보 확인')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('체크인 완료'))

      // Select charcoal time
      await waitFor(() => {
        const select = screen.getByRole('combobox')
        fireEvent.change(select, { target: { value: '오후 7시' } })
      })

      fireEvent.click(screen.getByText('선택 완료'))

      // Act - Open success modal
      await waitFor(() => {
        expect(screen.getByText('체크인 정보 보기')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('체크인 정보 보기'))

      // Assert - Check charcoal time is displayed
      await waitFor(() => {
        expect(screen.getByText('🔥 숯불 예약 시간')).toBeInTheDocument()
        expect(screen.getByText('오후 7시')).toBeInTheDocument()
      })
    })

    it('should NOT display charcoal time section when time is not selected', async () => {
      // Arrange
      ;(supabaseRest.select as jest.Mock).mockImplementation((table: string) => {
        if (table === 'campgrounds') return Promise.resolve([mockCampgroundData])
        if (table === 'reservations') return Promise.resolve([mockReservationData])
        return Promise.resolve([])
      })
      ;(supabaseRest.update as jest.Mock).mockResolvedValue({})

      render(<CheckInKiosk />)

      // Complete checkin flow without charcoal selection (skip)
      await waitFor(() => {
        expect(screen.getByPlaceholderText('예약자 이름을 입력하세요')).toBeInTheDocument()
      })

      const nameInput = screen.getByPlaceholderText('예약자 이름을 입력하세요')
      const phoneInput = screen.getByPlaceholderText(/연락처를 입력하세요/)

      fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      fireEvent.change(phoneInput, { target: { value: '010-1234-5678' } })
      fireEvent.click(screen.getByText('예약 확인'))

      await waitFor(() => {
        expect(screen.getByText('체크인 정보 확인')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('체크인 완료'))

      // Skip charcoal selection
      await waitFor(() => {
        expect(screen.getByText('건너뛰기')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('건너뛰기'))

      // Act - Open success modal
      await waitFor(() => {
        expect(screen.getByText('체크인 정보 보기')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('체크인 정보 보기'))

      // Assert - Charcoal time section should NOT be present
      await waitFor(() => {
        expect(screen.queryByText('🔥 숯불 예약 시간')).not.toBeInTheDocument()
      })
    })
  })
})
