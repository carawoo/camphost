import { 
  Campground, 
  Reservation, 
  User 
} from '../types'
import { StorageManager } from '../utils'
import { APP_CONFIG, DEFAULT_DATA } from '../constants'

// 기본 서비스 인터페이스
export interface BaseService<T> {
  getAll(): T[]
  getById(id: string): T | null
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T
  update(id: string, data: Partial<T>): T | null
  delete(id: string): boolean
}

// 캠핑장 서비스
export class CampgroundService implements BaseService<Campground> {
  private storageKey = APP_CONFIG.storageKeys.campgrounds

  getAll(): Campground[] {
    const stored = StorageManager.get<Campground[]>(this.storageKey)
    if (stored) return stored
    
    // 초기 데이터 저장
    const initialData = DEFAULT_DATA.SAMPLE_CAMPGROUNDS.map(campground => ({
      ...campground,
      id: campground.id,
      createdAt: campground.createdAt,
      updatedAt: new Date().toISOString(),
      owner: {
        id: `owner_${campground.id}`,
        name: campground.ownerName,
        email: campground.ownerEmail,
        phone: campground.ownerPhone,
        role: 'campground_owner' as const,
        createdAt: campground.createdAt,
        updatedAt: new Date().toISOString()
      },
      contactInfo: {
        phone: campground.contactPhone,
        email: campground.contactEmail
      }
    }))
    
    StorageManager.set(this.storageKey, initialData)
    return initialData
  }

  getById(id: string): Campground | null {
    const campgrounds = this.getAll()
    return campgrounds.find(campground => campground.id === id) || null
  }

  create(data: Omit<Campground, 'id' | 'createdAt' | 'updatedAt'>): Campground {
    const campgrounds = this.getAll()
    const newCampground: Campground = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const updatedCampgrounds = [...campgrounds, newCampground]
    StorageManager.set(this.storageKey, updatedCampgrounds)
    return newCampground
  }

  update(id: string, data: Partial<Campground>): Campground | null {
    const campgrounds = this.getAll()
    const index = campgrounds.findIndex(campground => campground.id === id)
    
    if (index === -1) return null
    
    const updatedCampground = {
      ...campgrounds[index],
      ...data,
      updatedAt: new Date().toISOString()
    }
    
    campgrounds[index] = updatedCampground
    StorageManager.set(this.storageKey, campgrounds)
    return updatedCampground
  }

  delete(id: string): boolean {
    const campgrounds = this.getAll()
    const filteredCampgrounds = campgrounds.filter(campground => campground.id !== id)
    
    if (filteredCampgrounds.length === campgrounds.length) return false
    
    StorageManager.set(this.storageKey, filteredCampgrounds)
    return true
  }

  // 추가 메서드들
  getByStatus(status: Campground['status']): Campground[] {
    return this.getAll().filter(campground => campground.status === status)
  }

  search(query: string): Campground[] {
    const campgrounds = this.getAll()
    const lowercaseQuery = query.toLowerCase()
    
    return campgrounds.filter(campground => 
      campground.name.toLowerCase().includes(lowercaseQuery) ||
      campground.owner.name.toLowerCase().includes(lowercaseQuery) ||
      campground.address.toLowerCase().includes(lowercaseQuery)
    )
  }

  updateStatus(id: string, status: Campground['status']): boolean {
    const updated = this.update(id, { 
      status, 
      lastActiveAt: new Date().toISOString() 
    })
    return updated !== null
  }
}

// 예약 서비스
export class ReservationService implements BaseService<Reservation> {
  private storageKey = APP_CONFIG.storageKeys.reservations

  getAll(): Reservation[] {
    const stored = StorageManager.get<Reservation[]>(this.storageKey)
    if (stored) return stored
    
    // 초기 데이터 저장
    const initialData: Reservation[] = [
      {
        id: '1',
        guest: {
          id: 'guest_1',
          name: '김철수',
          email: 'kim@example.com',
          phone: '010-1234-5678',
          role: 'guest',
          createdAt: '2025-01-01',
          updatedAt: new Date().toISOString()
        },
        campground: {
          id: 'odoichon',
          name: '오도이촌 캠핑장',
          owner: {
            id: 'owner_odoichon',
            name: '김사장',
            email: 'carawoo96@gmail.com',
            phone: '010-1234-5678',
            role: 'campground_owner',
            createdAt: '2025-01-01',
            updatedAt: new Date().toISOString()
          },
          contactInfo: {
            phone: '010-1234-5678',
            email: 'carawoo96@gmail.com'
          },
          address: '경기도 양평군 오도이촌',
          description: '도심과 자연을 잇는 캠핑장',
          status: 'active',
          subscriptionPlan: 'premium',
          createdAt: '2025-01-01',
          updatedAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          adminUrl: '/admin/dashboard?campground=오도이촌',
          kioskUrl: '/kiosk?campground=오도이촌'
        },
        roomNumber: 'A동-101',
        checkInDate: '2025-01-30',
        checkOutDate: '2025-02-01',
        guests: 4,
        totalAmount: 150000,
        status: 'confirmed',
        createdAt: '2025-01-01',
        updatedAt: new Date().toISOString()
      }
    ]
    
    StorageManager.set(this.storageKey, initialData)
    return initialData
  }

  getById(id: string): Reservation | null {
    const reservations = this.getAll()
    return reservations.find(reservation => reservation.id === id) || null
  }

  create(data: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>): Reservation {
    const reservations = this.getAll()
    const newReservation: Reservation = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const updatedReservations = [...reservations, newReservation]
    StorageManager.set(this.storageKey, updatedReservations)
    return newReservation
  }

  update(id: string, data: Partial<Reservation>): Reservation | null {
    const reservations = this.getAll()
    const index = reservations.findIndex(reservation => reservation.id === id)
    
    if (index === -1) return null
    
    const updatedReservation = {
      ...reservations[index],
      ...data,
      updatedAt: new Date().toISOString()
    }
    
    reservations[index] = updatedReservation
    StorageManager.set(this.storageKey, reservations)
    return updatedReservation
  }

  delete(id: string): boolean {
    const reservations = this.getAll()
    const filteredReservations = reservations.filter(reservation => reservation.id !== id)
    
    if (filteredReservations.length === reservations.length) return false
    
    StorageManager.set(this.storageKey, filteredReservations)
    return true
  }

  // 추가 메서드들
  findByGuest(guestName: string, phone: string): Reservation | null {
    const reservations = this.getAll()
    return reservations.find(reservation => 
      reservation.guest.name === guestName && 
      reservation.guest.phone === phone
    ) || null
  }

  updateStatus(id: string, status: Reservation['status']): boolean {
    const updated = this.update(id, { status })
    return updated !== null
  }

  getByCampground(campgroundId: string): Reservation[] {
    return this.getAll().filter(reservation => reservation.campground.id === campgroundId)
  }
}

// 사용자 서비스
export class UserService {
  private storageKey = APP_CONFIG.storageKeys.user

  getCurrentUser(): User | null {
    return StorageManager.get<User>(this.storageKey)
  }

  setCurrentUser(user: User): void {
    StorageManager.set(this.storageKey, user)
  }

  logout(): void {
    StorageManager.remove(this.storageKey)
  }

  authenticateSuperAdmin(username: string, password: string): boolean {
    if (username === DEFAULT_DATA.SUPER_ADMIN.username && 
        password === DEFAULT_DATA.SUPER_ADMIN.password) {
      const superAdmin: User = {
        id: 'super_admin',
        name: 'Super Admin',
        email: 'admin@odoichon.com',
        phone: '010-0000-0000',
        role: 'super_admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      this.setCurrentUser(superAdmin)
      return true
    }
    return false
  }
}

// 서비스 인스턴스들
export const campgroundService = new CampgroundService()
export const reservationService = new ReservationService()
export const userService = new UserService()
