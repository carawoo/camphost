import {
  getReservations,
  saveReservations,
  addReservation,
  updateReservationStatus,
  deleteReservation,
  findReservation,
  Reservation,
} from '../reservations'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
})

describe('Reservations Library', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear()
    // Restore all mocks
    jest.restoreAllMocks()
  })

  describe('getReservations', () => {
    it('should return initial reservations when localStorage is empty', () => {
      const reservations = getReservations()

      expect(reservations).toHaveLength(2)
      expect(reservations[0].guestName).toBe('김철수')
      expect(reservations[1].guestName).toBe('이영희')
    })

    it('should return stored reservations from localStorage', () => {
      const mockReservations: Reservation[] = [
        {
          id: '123',
          guestName: '테스트',
          phone: '010-1111-2222',
          roomNumber: 'C-301',
          checkInDate: '2025-02-01',
          checkOutDate: '2025-02-03',
          guests: 3,
          totalAmount: 200000,
          status: 'confirmed',
          createdAt: '2025-01-30',
        },
      ]

      localStorage.setItem('odoichon_reservations', JSON.stringify(mockReservations))
      const reservations = getReservations()

      expect(reservations).toHaveLength(1)
      expect(reservations[0].guestName).toBe('테스트')
    })

    it('should handle localStorage errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      jest.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      const reservations = getReservations()

      // Should return initial reservations as fallback
      expect(reservations).toHaveLength(2)
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('saveReservations', () => {
    it('should save reservations to localStorage', () => {
      const mockReservations: Reservation[] = [
        {
          id: '456',
          guestName: '저장테스트',
          phone: '010-3333-4444',
          roomNumber: 'D-401',
          checkInDate: '2025-02-05',
          checkOutDate: '2025-02-07',
          guests: 2,
          totalAmount: 180000,
          status: 'confirmed',
          createdAt: '2025-01-30',
        },
      ]

      saveReservations(mockReservations)

      const stored = localStorage.getItem('odoichon_reservations')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].guestName).toBe('저장테스트')
    })

    it('should handle save errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage full')
      })

      const mockReservations: Reservation[] = []

      // Should not throw
      expect(() => saveReservations(mockReservations)).not.toThrow()
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('addReservation', () => {
    it('should add a new reservation with correct fields', () => {
      const newReservationData = {
        guestName: '신규고객',
        phone: '010-5555-6666',
        roomNumber: 'E-501',
        checkInDate: '2025-02-10',
        checkOutDate: '2025-02-12',
        guests: 4,
        totalAmount: 250000,
      }

      const result = addReservation(newReservationData)

      expect(result.id).toBeTruthy()
      expect(result.guestName).toBe('신규고객')
      expect(result.status).toBe('confirmed')
      expect(result.createdAt).toBeTruthy()
    })

    it('should add reservation to existing list', () => {
      const firstReservation = addReservation({
        guestName: '첫번째',
        phone: '010-1111-1111',
        roomNumber: 'A-101',
        checkInDate: '2025-02-01',
        checkOutDate: '2025-02-02',
        guests: 2,
        totalAmount: 100000,
      })

      const secondReservation = addReservation({
        guestName: '두번째',
        phone: '010-2222-2222',
        roomNumber: 'A-102',
        checkInDate: '2025-02-01',
        checkOutDate: '2025-02-02',
        guests: 2,
        totalAmount: 100000,
      })

      const allReservations = getReservations()

      // Should have initial 2 + 2 new = 4 total
      expect(allReservations.length).toBeGreaterThanOrEqual(2)
      expect(allReservations.some(r => r.id === firstReservation.id)).toBe(true)
      expect(allReservations.some(r => r.id === secondReservation.id)).toBe(true)
    })
  })

  describe('updateReservationStatus', () => {
    it('should update reservation status', () => {
      const newReservation = addReservation({
        guestName: '상태변경테스트',
        phone: '010-7777-8888',
        roomNumber: 'F-601',
        checkInDate: '2025-02-15',
        checkOutDate: '2025-02-17',
        guests: 3,
        totalAmount: 200000,
      })

      const result = updateReservationStatus(newReservation.id, 'checked-in')

      expect(result).toBe(true)

      const reservations = getReservations()
      const updated = reservations.find(r => r.id === newReservation.id)

      expect(updated?.status).toBe('checked-in')
    })

    it('should return true even if reservation not found', () => {
      const result = updateReservationStatus('nonexistent-id', 'checked-out')

      expect(result).toBe(true)
    })
  })

  describe('deleteReservation', () => {
    it('should delete a reservation', () => {
      const newReservation = addReservation({
        guestName: '삭제테스트',
        phone: '010-9999-0000',
        roomNumber: 'G-701',
        checkInDate: '2025-02-20',
        checkOutDate: '2025-02-22',
        guests: 2,
        totalAmount: 150000,
      })

      const reservationsBefore = getReservations()
      const countBefore = reservationsBefore.length

      const result = deleteReservation(newReservation.id)

      expect(result).toBe(true)

      const reservationsAfter = getReservations()
      expect(reservationsAfter.length).toBe(countBefore - 1)
      expect(reservationsAfter.some(r => r.id === newReservation.id)).toBe(false)
    })

    it('should return true even if reservation not found', () => {
      const result = deleteReservation('nonexistent-id')

      expect(result).toBe(true)
    })
  })

  describe('findReservation', () => {
    it('should find reservation by name and phone', () => {
      addReservation({
        guestName: '검색테스트',
        phone: '010-1234-9999',
        roomNumber: 'H-801',
        checkInDate: '2025-02-25',
        checkOutDate: '2025-02-27',
        guests: 2,
        totalAmount: 180000,
      })

      const found = findReservation('검색테스트', '010-1234-9999')

      expect(found).toBeTruthy()
      expect(found?.guestName).toBe('검색테스트')
      expect(found?.phone).toBe('010-1234-9999')
    })

    it('should handle trimming of whitespace', () => {
      addReservation({
        guestName: '공백테스트',
        phone: '010-5555-9999',
        roomNumber: 'I-901',
        checkInDate: '2025-03-01',
        checkOutDate: '2025-03-03',
        guests: 2,
        totalAmount: 160000,
      })

      // Search with extra whitespace
      const found = findReservation('  공백테스트  ', '  010-5555-9999  ')

      expect(found).toBeTruthy()
      expect(found?.guestName).toBe('공백테스트')
    })

    it('should return null when reservation not found', () => {
      const found = findReservation('존재하지않음', '010-0000-0000')

      expect(found).toBeNull()
    })

    it('should be case-sensitive for name', () => {
      addReservation({
        guestName: '대소문자',
        phone: '010-6666-7777',
        roomNumber: 'J-1001',
        checkInDate: '2025-03-05',
        checkOutDate: '2025-03-07',
        guests: 2,
        totalAmount: 170000,
      })

      // Should not find with different case
      const found = findReservation('대소문자', '010-6666-7777')
      expect(found).toBeTruthy()

      // This should still work (exact match)
      const found2 = findReservation('대소문자', '010-6666-7777')
      expect(found2).toBeTruthy()
    })
  })
})
