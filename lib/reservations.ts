// 예약 데이터 관리 유틸리티
export interface Reservation {
  id: string
  guestName: string
  phone: string
  roomNumber: string
  checkInDate: string
  checkOutDate: string
  guests: number
  totalAmount: number
  status: 'confirmed' | 'checked-in' | 'checked-out'
  createdAt: string
  actualCheckinTime?: string
  actualCheckoutTime?: string
}

const STORAGE_KEY = 'odoichon_reservations'

// 초기 샘플 데이터
const initialReservations: Reservation[] = [
  {
    id: '1',
    guestName: '김철수',
    phone: '010-1234-5678',
    roomNumber: 'A동-101',
    checkInDate: '2025-01-30', // 오늘 날짜로 고정
    checkOutDate: '2025-02-01', // 2일 후
    guests: 4,
    totalAmount: 150000,
    status: 'confirmed',
    createdAt: '2025-01-30'
  },
  {
    id: '2',
    guestName: '이영희',
    phone: '010-9876-5432',
    roomNumber: 'B동-201',
    checkInDate: '2025-01-30', // 오늘 날짜로 고정
    checkOutDate: '2025-02-02', // 3일 후
    guests: 2,
    totalAmount: 120000,
    status: 'confirmed',
    createdAt: '2025-01-30'
  }
]

// localStorage에서 예약 데이터 가져오기
export const getReservations = (): Reservation[] => {
  if (typeof window === 'undefined') return initialReservations
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    // 초기 데이터 저장
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialReservations))
    return initialReservations
  } catch (error) {
    console.error('Failed to load reservations:', error)
    return initialReservations
  }
}

// localStorage에 예약 데이터 저장
export const saveReservations = (reservations: Reservation[]): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations))
  } catch (error) {
    console.error('Failed to save reservations:', error)
  }
}

// 새 예약 추가
export const addReservation = (reservationData: Omit<Reservation, 'id' | 'status' | 'createdAt'>): Reservation => {
  const reservations = getReservations()
  const newReservation: Reservation = {
    id: Date.now().toString(),
    ...reservationData,
    status: 'confirmed',
    createdAt: new Date().toISOString().split('T')[0]
  }
  
  const updatedReservations = [...reservations, newReservation]
  saveReservations(updatedReservations)
  return newReservation
}

// 예약 상태 업데이트
export const updateReservationStatus = (id: string, status: Reservation['status']): boolean => {
  const reservations = getReservations()
  const updatedReservations = reservations.map(reservation => 
    reservation.id === id ? { ...reservation, status } : reservation
  )
  
  saveReservations(updatedReservations)
  return true
}

// 예약 삭제
export const deleteReservation = (id: string): boolean => {
  const reservations = getReservations()
  const updatedReservations = reservations.filter(reservation => reservation.id !== id)
  
  saveReservations(updatedReservations)
  return true
}

// 예약 검색 (이름과 전화번호로)
export const findReservation = (guestName: string, phone: string): Reservation | null => {
  const reservations = getReservations()
  return reservations.find(reservation => 
    reservation.guestName.trim() === guestName.trim() && 
    reservation.phone.trim() === phone.trim()
  ) || null
}
