/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ReservationManagement from '../page'
import { supabaseRest } from '@/services/supabaseRest'

// Mock Next.js Link
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
    insert: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('ReservationManagement - Charcoal Reservation Display', () => {
  const mockCampgroundId = 'campground-123'

  const mockReservations = [
    {
      id: 'res-1',
      campground_id: mockCampgroundId,
      guest_name: 'John Doe',
      phone: '010-1111-1111',
      room_number: 'A-101',
      check_in_date: '2025-10-30',
      check_out_date: '2025-10-31',
      guests: 2,
      total_amount: 100000,
      status: 'confirmed',
      created_at: '2025-10-30T10:00:00Z',
      updated_at: '2025-10-30T10:00:00Z',
      charcoal_reservation_time: '오후 7시',
    },
    {
      id: 'res-2',
      campground_id: mockCampgroundId,
      guest_name: 'Jane Smith',
      phone: '010-2222-2222',
      room_number: 'A-102',
      check_in_date: '2025-10-30',
      check_out_date: '2025-10-31',
      guests: 3,
      total_amount: 120000,
      status: 'checked-in',
      created_at: '2025-10-30T11:00:00Z',
      updated_at: '2025-10-30T11:00:00Z',
      charcoal_reservation_time: '오후 8시',
    },
    {
      id: 'res-3',
      campground_id: mockCampgroundId,
      guest_name: 'Bob Wilson',
      phone: '010-3333-3333',
      room_number: 'A-103',
      check_in_date: '2025-10-30',
      check_out_date: '2025-10-31',
      guests: 4,
      total_amount: 150000,
      status: 'checked-out',
      created_at: '2025-10-30T12:00:00Z',
      updated_at: '2025-10-30T12:00:00Z',
      charcoal_reservation_time: null,
    },
  ]

  beforeEach(() => {
    // Mock window.location.search
    window.location.search = '?campground=Test Campground'

    // Reset all mocks
    jest.clearAllMocks()
    ;(supabaseRest.isEnabled as jest.Mock).mockReturnValue(true)

    // Mock campground select
    ;(supabaseRest.select as jest.Mock).mockImplementation((table: string) => {
      if (table === 'campgrounds') {
        return Promise.resolve([{ id: mockCampgroundId, name: 'Test Campground' }])
      }
      if (table === 'reservations') {
        return Promise.resolve(mockReservations)
      }
      return Promise.resolve([])
    })
  })

  describe('Load reservations with charcoal_reservation_time', () => {
    it('should load reservations from Supabase with charcoal_reservation_time field', async () => {
      // Act
      render(<ReservationManagement />)

      // Assert
      await waitFor(() => {
        expect(supabaseRest.select).toHaveBeenCalledWith(
          'reservations',
          expect.stringContaining(`?campground_id=eq.${mockCampgroundId}`)
        )
      })
    })

    it('should correctly map charcoal_reservation_time from Supabase data', async () => {
      // Act
      render(<ReservationManagement />)

      // Assert - Check that reservations with charcoal time are displayed
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
      })
    })
  })

  describe('Fire badge display', () => {
    it('should display fire badge (🔥) next to guest name when charcoalReservationTime exists', async () => {
      // Act
      render(<ReservationManagement />)

      // Assert
      await waitFor(() => {
        const johnCard = screen.getByText('John Doe').closest('.reservation-card')
        expect(johnCard).toBeInTheDocument()
        expect(johnCard?.textContent).toContain('🔥')

        const janeCard = screen.getByText('Jane Smith').closest('.reservation-card')
        expect(janeCard).toBeInTheDocument()
        expect(janeCard?.textContent).toContain('🔥')
      })
    })

    it('should NOT display fire badge when charcoalReservationTime is null', async () => {
      // Act
      render(<ReservationManagement />)

      // Assert
      await waitFor(() => {
        const bobCard = screen.getByText('Bob Wilson').closest('.reservation-card')
        expect(bobCard).toBeInTheDocument()

        // Check that fire emoji is not in Bob's card
        const bobHeader = bobCard?.querySelector('.guest-info')
        expect(bobHeader?.textContent).not.toContain('🔥')
      })
    })
  })

  describe('Charcoal time detail display', () => {
    it('should display charcoal reservation time in detail section when it exists', async () => {
      // Act
      render(<ReservationManagement />)

      // Assert
      await waitFor(() => {
        // Find John's card details
        const johnCard = screen.getByText('John Doe').closest('.reservation-card')
        expect(johnCard).toBeInTheDocument()

        // Check for charcoal time display
        expect(johnCard?.textContent).toContain('🔥 숯불 예약:')
        expect(johnCard?.textContent).toContain('오후 7시')
      })
    })

    it('should display correct charcoal time for each reservation', async () => {
      // Act
      render(<ReservationManagement />)

      // Assert
      await waitFor(() => {
        const johnCard = screen.getByText('John Doe').closest('.reservation-card')
        expect(johnCard?.textContent).toContain('오후 7시')

        const janeCard = screen.getByText('Jane Smith').closest('.reservation-card')
        expect(janeCard?.textContent).toContain('오후 8시')
      })
    })

    it('should NOT display charcoal detail when charcoalReservationTime is null', async () => {
      // Act
      render(<ReservationManagement />)

      // Assert
      await waitFor(() => {
        const bobCard = screen.getByText('Bob Wilson').closest('.reservation-card')
        expect(bobCard).toBeInTheDocument()

        // Should not have charcoal time detail
        expect(bobCard?.textContent).not.toContain('🔥 숯불 예약:')
      })
    })
  })

  describe('Filter button - charcoal count', () => {
    it('should display correct count of reservations with charcoal time', async () => {
      // Act
      render(<ReservationManagement />)

      // Assert - 2 reservations have charcoal_reservation_time
      await waitFor(() => {
        const filterButton = screen.getByText(/🔥 숯불 예약 \(\d+\)/)
        expect(filterButton).toBeInTheDocument()
        expect(filterButton.textContent).toBe('🔥 숯불 예약 (2)')
      })
    })

    it('should update count when reservations are added', async () => {
      // Arrange
      const updatedReservations = [
        ...mockReservations,
        {
          id: 'res-4',
          campground_id: mockCampgroundId,
          guest_name: 'Alice Brown',
          phone: '010-4444-4444',
          room_number: 'A-104',
          check_in_date: '2025-10-30',
          check_out_date: '2025-10-31',
          guests: 2,
          total_amount: 100000,
          status: 'confirmed',
          created_at: '2025-10-30T13:00:00Z',
          updated_at: '2025-10-30T13:00:00Z',
          charcoal_reservation_time: '오후 9시',
        },
      ]

      ;(supabaseRest.select as jest.Mock).mockImplementation((table: string) => {
        if (table === 'campgrounds') {
          return Promise.resolve([{ id: mockCampgroundId, name: 'Test Campground' }])
        }
        if (table === 'reservations') {
          return Promise.resolve(updatedReservations)
        }
        return Promise.resolve([])
      })

      // Act
      render(<ReservationManagement />)

      // Assert - Should show 3 reservations with charcoal
      await waitFor(() => {
        const filterButton = screen.getByText(/🔥 숯불 예약 \(\d+\)/)
        expect(filterButton.textContent).toBe('🔥 숯불 예약 (3)')
      })
    })

    it('should show count of 0 when no reservations have charcoal time', async () => {
      // Arrange
      const noCharcoalReservations = mockReservations.map((r) => ({
        ...r,
        charcoal_reservation_time: null,
      }))

      ;(supabaseRest.select as jest.Mock).mockImplementation((table: string) => {
        if (table === 'campgrounds') {
          return Promise.resolve([{ id: mockCampgroundId, name: 'Test Campground' }])
        }
        if (table === 'reservations') {
          return Promise.resolve(noCharcoalReservations)
        }
        return Promise.resolve([])
      })

      // Act
      render(<ReservationManagement />)

      // Assert
      await waitFor(() => {
        const filterButton = screen.getByText(/🔥 숯불 예약 \(\d+\)/)
        expect(filterButton.textContent).toBe('🔥 숯불 예약 (0)')
      })
    })
  })

  describe('Filter functionality - charcoal filter', () => {
    it('should filter reservations to show only those with charcoal time when filter is clicked', async () => {
      // Act
      render(<ReservationManagement />)

      // Assert - All reservations initially visible
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
      })

      // Act - Click charcoal filter
      const charcoalFilterButton = screen.getByText(/🔥 숯불 예약 \(\d+\)/)
      fireEvent.click(charcoalFilterButton)

      // Assert - Only reservations with charcoal time should be visible
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument()
      })
    })

    it('should toggle charcoal filter off when clicked again', async () => {
      // Act
      render(<ReservationManagement />)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      // Click filter on
      const charcoalFilterButton = screen.getByText(/🔥 숯불 예약 \(\d+\)/)
      fireEvent.click(charcoalFilterButton)

      await waitFor(() => {
        expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument()
      })

      // Click filter off
      fireEvent.click(charcoalFilterButton)

      // Assert - All reservations should be visible again
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
      })
    })

    it('should add active class to filter button when filter is active', async () => {
      // Act
      render(<ReservationManagement />)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      const charcoalFilterButton = screen.getByText(/🔥 숯불 예약 \(\d+\)/)

      // Initially not active
      expect(charcoalFilterButton.className).not.toContain('active')

      // Click to activate
      fireEvent.click(charcoalFilterButton)

      // Assert - Should have active class
      await waitFor(() => {
        expect(charcoalFilterButton.className).toContain('active')
      })
    })
  })

  describe('Combined filters - status + charcoal', () => {
    it('should filter by both status and charcoal when both filters are active', async () => {
      // Act
      render(<ReservationManagement />)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      // Click "checked-in" status filter
      const checkedInButton = screen.getByText(/체크인 \(\d+\)/)
      fireEvent.click(checkedInButton)

      // Click charcoal filter
      const charcoalFilterButton = screen.getByText(/🔥 숯불 예약 \(\d+\)/)
      fireEvent.click(charcoalFilterButton)

      // Assert - Only Jane should be visible (checked-in + charcoal time)
      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument() // confirmed status
        expect(screen.getByText('Jane Smith')).toBeInTheDocument() // checked-in + charcoal
        expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument() // no charcoal time
      })
    })

    it('should show correct results when filtering confirmed + charcoal', async () => {
      // Act
      render(<ReservationManagement />)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      // Click "confirmed" status filter
      const confirmedButton = screen.getByText(/확정 \(\d+\)/)
      fireEvent.click(confirmedButton)

      // Click charcoal filter
      const charcoalFilterButton = screen.getByText(/🔥 숯불 예약 \(\d+\)/)
      fireEvent.click(charcoalFilterButton)

      // Assert - Only John should be visible (confirmed + charcoal time)
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument() // confirmed + charcoal
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument() // checked-in status
        expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument() // no charcoal time
      })
    })

    it('should reset to all when switching to all status filter while charcoal filter is active', async () => {
      // Act
      render(<ReservationManagement />)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      // Activate charcoal filter
      const charcoalFilterButton = screen.getByText(/🔥 숯불 예약 \(\d+\)/)
      fireEvent.click(charcoalFilterButton)

      await waitFor(() => {
        expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument()
      })

      // Filter by confirmed
      const confirmedButton = screen.getByText(/확정 \(\d+\)/)
      fireEvent.click(confirmedButton)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
      })

      // Switch back to "all" status
      const allButton = screen.getByText(/전체 \(\d+\)/)
      fireEvent.click(allButton)

      // Assert - Should show all reservations with charcoal (charcoal filter still active)
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument() // no charcoal
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle empty charcoal_reservation_time string as no charcoal', async () => {
      // Arrange
      const reservationsWithEmptyString = [
        {
          ...mockReservations[0],
          charcoal_reservation_time: '',
        },
      ]

      ;(supabaseRest.select as jest.Mock).mockImplementation((table: string) => {
        if (table === 'campgrounds') {
          return Promise.resolve([{ id: mockCampgroundId, name: 'Test Campground' }])
        }
        if (table === 'reservations') {
          return Promise.resolve(reservationsWithEmptyString)
        }
        return Promise.resolve([])
      })

      // Act
      render(<ReservationManagement />)

      // Assert
      await waitFor(() => {
        const card = screen.getByText('John Doe').closest('.reservation-card')
        expect(card?.textContent).not.toContain('🔥 숯불 예약:')
      })
    })

    it('should handle undefined charcoal_reservation_time', async () => {
      // Arrange
      const reservationsWithUndefined = [
        {
          ...mockReservations[0],
          charcoal_reservation_time: undefined,
        },
      ]

      ;(supabaseRest.select as jest.Mock).mockImplementation((table: string) => {
        if (table === 'campgrounds') {
          return Promise.resolve([{ id: mockCampgroundId, name: 'Test Campground' }])
        }
        if (table === 'reservations') {
          return Promise.resolve(reservationsWithUndefined)
        }
        return Promise.resolve([])
      })

      // Act
      render(<ReservationManagement />)

      // Assert
      await waitFor(() => {
        const card = screen.getByText('John Doe').closest('.reservation-card')
        expect(card?.textContent).not.toContain('🔥 숯불 예약:')
      })
    })

    it('should correctly count when all reservations have charcoal time', async () => {
      // Arrange
      const allWithCharcoal = mockReservations.map((r) => ({
        ...r,
        charcoal_reservation_time: '오후 7시',
      }))

      ;(supabaseRest.select as jest.Mock).mockImplementation((table: string) => {
        if (table === 'campgrounds') {
          return Promise.resolve([{ id: mockCampgroundId, name: 'Test Campground' }])
        }
        if (table === 'reservations') {
          return Promise.resolve(allWithCharcoal)
        }
        return Promise.resolve([])
      })

      // Act
      render(<ReservationManagement />)

      // Assert
      await waitFor(() => {
        const filterButton = screen.getByText(/🔥 숯불 예약 \(\d+\)/)
        expect(filterButton.textContent).toBe('🔥 숯불 예약 (3)')
      })
    })
  })

  describe('Polling updates', () => {
    it('should refresh reservations periodically and update charcoal count', async () => {
      // Arrange
      jest.useFakeTimers()

      let callCount = 0
      ;(supabaseRest.select as jest.Mock).mockImplementation((table: string) => {
        if (table === 'campgrounds') {
          return Promise.resolve([{ id: mockCampgroundId, name: 'Test Campground' }])
        }
        if (table === 'reservations') {
          callCount++
          // First load: 2 with charcoal
          // After 5 seconds: 3 with charcoal
          if (callCount === 1) {
            return Promise.resolve(mockReservations)
          } else {
            return Promise.resolve([
              ...mockReservations.slice(0, 2), // Keep first two (with charcoal)
              {
                ...mockReservations[2],
                charcoal_reservation_time: '오후 9시', // Add charcoal to third
              },
            ])
          }
        }
        return Promise.resolve([])
      })

      // Act
      render(<ReservationManagement />)

      // Initial load
      await waitFor(() => {
        const filterButton = screen.getByText(/🔥 숯불 예약 \(\d+\)/)
        expect(filterButton.textContent).toBe('🔥 숯불 예약 (2)')
      })

      // Fast-forward 5 seconds
      jest.advanceTimersByTime(5000)

      // Assert - Count should update to 3
      await waitFor(() => {
        const filterButton = screen.getByText(/🔥 숯불 예약 \(\d+\)/)
        expect(filterButton.textContent).toBe('🔥 숯불 예약 (3)')
      })

      jest.useRealTimers()
    })
  })
})
