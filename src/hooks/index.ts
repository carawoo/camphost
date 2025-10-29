import { useState, useEffect, useCallback } from 'react'
import { 
  Campground, 
  Reservation, 
  User, 
  FilterOptions, 
  FormState 
} from '../types'
import { 
  campgroundService, 
  reservationService, 
  userService 
} from '../services'
import { ValidationUtils } from '../utils'

// 캠핑장 관리 훅
export function useCampgrounds() {
  const [campgrounds, setCampgrounds] = useState<Campground[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCampgrounds = useCallback(() => {
    try {
      const data = campgroundService.getAll()
      setCampgrounds(data)
      setError(null)
    } catch (err) {
      setError('캠핑장 데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addCampground = useCallback((data: Omit<Campground, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newCampground = campgroundService.create(data)
      setCampgrounds(prev => [...prev, newCampground])
      return newCampground
    } catch (err) {
      setError('캠핑장 추가에 실패했습니다.')
      throw err
    }
  }, [])

  const updateCampground = useCallback((id: string, data: Partial<Campground>) => {
    try {
      const updated = campgroundService.update(id, data)
      if (updated) {
        setCampgrounds(prev => 
          prev.map(campground => 
            campground.id === id ? updated : campground
          )
        )
      }
      return updated
    } catch (err) {
      setError('캠핑장 업데이트에 실패했습니다.')
      throw err
    }
  }, [])

  const deleteCampground = useCallback((id: string) => {
    try {
      const success = campgroundService.delete(id)
      if (success) {
        setCampgrounds(prev => prev.filter(campground => campground.id !== id))
      }
      return success
    } catch (err) {
      setError('캠핑장 삭제에 실패했습니다.')
      throw err
    }
  }, [])

  useEffect(() => {
    loadCampgrounds()
  }, [loadCampgrounds])

  return {
    campgrounds,
    isLoading,
    error,
    addCampground,
    updateCampground,
    deleteCampground,
    refetch: loadCampgrounds
  }
}

// 예약 관리 훅
export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadReservations = useCallback(() => {
    try {
      const data = reservationService.getAll()
      setReservations(data)
      setError(null)
    } catch (err) {
      setError('예약 데이터를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addReservation = useCallback((data: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newReservation = reservationService.create(data)
      setReservations(prev => [...prev, newReservation])
      return newReservation
    } catch (err) {
      setError('예약 추가에 실패했습니다.')
      throw err
    }
  }, [])

  const updateReservation = useCallback((id: string, data: Partial<Reservation>) => {
    try {
      const updated = reservationService.update(id, data)
      if (updated) {
        setReservations(prev => 
          prev.map(reservation => 
            reservation.id === id ? updated : reservation
          )
        )
      }
      return updated
    } catch (err) {
      setError('예약 업데이트에 실패했습니다.')
      throw err
    }
  }, [])

  const deleteReservation = useCallback((id: string) => {
    try {
      const success = reservationService.delete(id)
      if (success) {
        setReservations(prev => prev.filter(reservation => reservation.id !== id))
      }
      return success
    } catch (err) {
      setError('예약 삭제에 실패했습니다.')
      throw err
    }
  }, [])

  useEffect(() => {
    loadReservations()
  }, [loadReservations])

  return {
    reservations,
    isLoading,
    error,
    addReservation,
    updateReservation,
    deleteReservation,
    refetch: loadReservations
  }
}

// 사용자 인증 훅
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadUser = useCallback(() => {
    const currentUser = userService.getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const login = useCallback((username: string, password: string) => {
    const success = userService.authenticateSuperAdmin(username, password)
    if (success) {
      const currentUser = userService.getCurrentUser()
      setUser(currentUser)
    }
    return success
  }, [])

  const logout = useCallback(() => {
    userService.logout()
    setUser(null)
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  }
}

// 폼 관리 훅
export function useForm<T extends Record<string, any>>(
  initialData: T,
  validationRules?: Partial<Record<keyof T, (value: any) => boolean>>
) {
  const [formState, setFormState] = useState<FormState<T>>({
    data: initialData,
    errors: {},
    isSubmitting: false,
    isValid: true
  })

  const updateField = useCallback((field: keyof T, value: any) => {
    setFormState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value
      },
      errors: {
        ...prev.errors,
        [field]: undefined
      }
    }))
  }, [])

  const validateForm = useCallback(() => {
    if (!validationRules) return true

    const errors = ValidationUtils.validateForm(formState.data, validationRules)
    const isValid = Object.keys(errors).length === 0

    setFormState(prev => ({
      ...prev,
      errors,
      isValid
    }))

    return isValid
  }, [formState.data, validationRules])

  const resetForm = useCallback(() => {
    setFormState({
      data: initialData,
      errors: {},
      isSubmitting: false,
      isValid: true
    })
  }, [initialData])

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setFormState(prev => ({ ...prev, isSubmitting }))
  }, [])

  return {
    formState,
    updateField,
    validateForm,
    resetForm,
    setSubmitting
  }
}

// 필터링 및 검색 훅
export function useFilteredData<T>(
  data: T[],
  filterFn: (item: T, filters: FilterOptions) => boolean
) {
  const [filters, setFilters] = useState<FilterOptions>({})

  const filteredData = data.filter(item => filterFn(item, filters))

  const updateFilter = useCallback((key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  return {
    filteredData,
    filters,
    updateFilter,
    clearFilters
  }
}

// 로컬 스토리지 훅
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue] as const
}
