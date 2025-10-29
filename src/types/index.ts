// 공통 타입 정의
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

// 사용자 관련 타입
export interface User extends BaseEntity {
  name: string
  email: string
  phone: string
  role: 'super_admin' | 'campground_owner' | 'guest'
}

// 캠핑장 관련 타입
export interface Campground extends BaseEntity {
  name: string
  owner: User
  contactInfo: ContactInfo
  address: string
  description: string
  status: CampgroundStatus
  subscriptionPlan: SubscriptionPlan
  lastActiveAt: string
  adminUrl: string
  kioskUrl: string
}

export interface ContactInfo {
  phone: string
  email: string
}

export type CampgroundStatus = 'active' | 'pending' | 'suspended' | 'terminated'

export type SubscriptionPlan = 'basic' | 'premium' | 'enterprise'

// 예약 관련 타입
export interface Reservation extends BaseEntity {
  guest: User
  campground: Campground
  roomNumber: string
  checkInDate: string
  checkOutDate: string
  guests: number
  totalAmount: number
  status: ReservationStatus
}

export type ReservationStatus = 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled'

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 폼 관련 타입
export interface FormState<T> {
  data: T
  errors: Partial<Record<keyof T, string>>
  isSubmitting: boolean
  isValid: boolean
}

// 필터 및 검색 타입
export interface FilterOptions {
  status?: CampgroundStatus | 'all'
  search?: string
  page?: number
  limit?: number
}

// 컴포넌트 Props 타입
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
}

export interface TableColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, item: T) => React.ReactNode
}

// 상태 관리 타입
export interface AppState {
  user: User | null
  campgrounds: Campground[]
  reservations: Reservation[]
  isLoading: boolean
  error: string | null
}

export interface Action<T = any> {
  type: string
  payload?: T
}

// 설정 타입
export interface AppConfig {
  apiBaseUrl: string
  storageKeys: {
    user: string
    campgrounds: string
    reservations: string
    campgroundInfo: string
  }
  defaultPagination: {
    page: number
    limit: number
  }
}
