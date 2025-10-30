/**
 * @jest-environment node
 */

// Mock Resend before importing
const mockSend = jest.fn()
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: mockSend,
    },
  })),
}))

import { POST } from '../route'

describe('Checkin Notification API', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    mockSend.mockReset()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('POST /api/notify/checkin', () => {
    it('should return error when RESEND_API_KEY is not configured', async () => {
      delete process.env.RESEND_API_KEY

      const request = new Request('http://localhost:3000/api/notify/checkin', {
        method: 'POST',
        body: JSON.stringify({
          campgroundName: '테스트캠핑장',
          guestName: '홍길동',
          phone: '010-1234-5678',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('RESEND_API_KEY not configured')
    })

    it('should send email notification with all fields', async () => {
      process.env.RESEND_API_KEY = 'test-api-key'
      process.env.NOTIFY_EMAIL = 'test@example.com'

      mockSend.mockResolvedValue({ id: 'email-id-123' })

      const requestBody = {
        campgroundName: '오도이촌캠핑장',
        guestName: '김철수',
        phone: '010-1234-5678',
        roomNumber: 'A-101',
        checkInDate: '2025-02-01',
        checkOutDate: '2025-02-03',
        guests: 4,
        amount: 150000,
        contactPhone: '010-9876-5432',
        contactEmail: 'admin@campground.com',
      }

      const request = new Request('http://localhost:3000/api/notify/checkin', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.ok).toBe(true)

      expect(mockSend).toHaveBeenCalledTimes(1)
      expect(mockSend).toHaveBeenCalledWith({
        from: 'Odoichon <no-reply@odoichon.com>',
        to: 'test@example.com',
        subject: '체크인 알림 - 오도이촌캠핑장',
        text: expect.stringContaining('캠핑장: 오도이촌캠핑장'),
      })

      const emailCall = mockSend.mock.calls[0][0]
      expect(emailCall.text).toContain('고객명: 김철수')
      expect(emailCall.text).toContain('연락처: 010-1234-5678')
      expect(emailCall.text).toContain('객실: A-101')
      expect(emailCall.text).toContain('체크인/아웃: 2025-02-01 ~ 2025-02-03')
      expect(emailCall.text).toContain('인원: 4')
      expect(emailCall.text).toContain('금액: 150,000원')
      expect(emailCall.text).toContain('문의(사장님): 010-9876-5432 / admin@campground.com')
    })

    it('should use default NOTIFY_EMAIL when not specified', async () => {
      process.env.RESEND_API_KEY = 'test-api-key'
      delete process.env.NOTIFY_EMAIL

      mockSend.mockResolvedValue({ id: 'email-id-456' })

      const request = new Request('http://localhost:3000/api/notify/checkin', {
        method: 'POST',
        body: JSON.stringify({
          campgroundName: '테스트캠핑장',
          guestName: '이영희',
        }),
      })

      const response = await POST(request)
      await response.json()

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'odoichon@odoichon.com',
        })
      )
    })

    it('should handle missing optional fields gracefully', async () => {
      process.env.RESEND_API_KEY = 'test-api-key'

      mockSend.mockResolvedValue({ id: 'email-id-789' })

      const request = new Request('http://localhost:3000/api/notify/checkin', {
        method: 'POST',
        body: JSON.stringify({
          campgroundName: '최소정보캠핑장',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.ok).toBe(true)

      const emailCall = mockSend.mock.calls[0][0]
      expect(emailCall.text).toContain('고객명: -')
      expect(emailCall.text).toContain('연락처: -')
      expect(emailCall.text).toContain('객실: -')
    })

    it('should handle Resend API errors', async () => {
      process.env.RESEND_API_KEY = 'test-api-key'

      mockSend.mockRejectedValue(new Error('Resend API error'))

      const request = new Request('http://localhost:3000/api/notify/checkin', {
        method: 'POST',
        body: JSON.stringify({
          campgroundName: '에러테스트캠핑장',
          guestName: '박민수',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Resend API error')
    })

    it('should format amount with thousand separator', async () => {
      process.env.RESEND_API_KEY = 'test-api-key'

      mockSend.mockResolvedValue({ id: 'email-id-999' })

      const request = new Request('http://localhost:3000/api/notify/checkin', {
        method: 'POST',
        body: JSON.stringify({
          campgroundName: '금액테스트캠핑장',
          amount: 1234567,
        }),
      })

      await POST(request)

      const emailCall = mockSend.mock.calls[0][0]
      expect(emailCall.text).toContain('금액: 1,234,567원')
    })

    it('should handle invalid JSON body', async () => {
      process.env.RESEND_API_KEY = 'test-api-key'

      const request = new Request('http://localhost:3000/api/notify/checkin', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeTruthy()
    })
  })
})
