/**
 * @jest-environment node
 */

// Mock the supabaseRest service before any imports
jest.mock('@/services/supabaseRest', () => ({
  supabaseRest: {
    isEnabled: jest.fn(() => true),
    select: jest.fn(),
  },
}))

import { NextRequest } from 'next/server'
import { POST } from '../route'
import { supabaseRest } from '@/services/supabaseRest'

// Get the mocked functions
const mockSelect = supabaseRest.select as jest.MockedFunction<typeof supabaseRest.select>
const mockIsEnabled = supabaseRest.isEnabled as jest.MockedFunction<typeof supabaseRest.isEnabled>

describe('Admin Login API', () => {
  beforeEach(() => {
    mockSelect.mockReset()
    mockIsEnabled.mockReturnValue(true)
  })

  describe('Terminated Campground Handling', () => {
    it('should reject login for terminated campground with 403 status', async () => {
      // Mock Supabase to return a terminated campground
      mockSelect.mockResolvedValue([
        {
          id: 'test-id',
          name: '용오름밸리 캠핑장',
          admin_password: '0000',
          status: 'terminated',
        },
      ])

      const request = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          campgroundName: '용오름밸리 캠핑장',
          password: '0000',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('삭제된 캠핑장입니다. 로그인할 수 없습니다.')
    })

    it('should allow login for active campground', async () => {
      // Mock Supabase to return an active campground
      mockSelect.mockResolvedValue([
        {
          id: 'test-id',
          name: '테스트캠핑장',
          admin_password: 'test123',
          status: 'active',
        },
      ])

      const request = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          campgroundName: '테스트캠핑장',
          password: 'test123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.campgroundName).toBe('테스트캠핑장')
      expect(data.campgroundId).toBe('test-id')
    })

    it('should reject login with wrong password', async () => {
      // Mock Supabase to return a campground
      mockSelect.mockResolvedValue([
        {
          id: 'test-id',
          name: '테스트캠핑장',
          admin_password: 'test123',
          status: 'active',
        },
      ])

      const request = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          campgroundName: '테스트캠핑장',
          password: 'wrongpassword',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('캠핑장 이름 또는 비밀번호가 올바르지 않습니다.')
    })

    it('should reject login when campground is not found', async () => {
      // Mock Supabase to return empty array
      mockSelect.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          campgroundName: '존재하지않는캠핑장',
          password: 'test123',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('캠핑장 이름 또는 비밀번호가 올바르지 않습니다.')
    })

    it('should return 400 when campgroundName or password is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          campgroundName: '',
          password: '',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('캠핑장 이름과 비밀번호를 입력해주세요.')
    })
  })

  describe('Fallback Credentials', () => {
    it('should use fallback credentials when Supabase returns no match', async () => {
      // Mock Supabase to return empty array
      mockSelect.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          campgroundName: '오도이촌',
          password: '0000',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.campgroundName).toBe('오도이촌')
    })
  })
})
