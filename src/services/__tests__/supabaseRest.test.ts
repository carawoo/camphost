/**
 * @jest-environment node
 */

import { supabaseRest } from '../supabaseRest'

describe('supabaseRest', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset environment variables
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    }

    // Mock global fetch
    global.fetch = jest.fn()
  })

  afterEach(() => {
    process.env = originalEnv
    jest.clearAllMocks()
  })

  describe('isEnabled', () => {
    it('should return true when URL and key are set', () => {
      expect(supabaseRest.isEnabled()).toBe(true)
    })

    it('should return false when URL is missing', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = ''
      // Need to reload module to get new env values
      jest.resetModules()
      const { supabaseRest: supabaseRestReloaded } = require('../supabaseRest')
      expect(supabaseRestReloaded.isEnabled()).toBe(false)
    })

    it('should return false when key is missing', () => {
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ''
      jest.resetModules()
      const { supabaseRest: supabaseRestReloaded } = require('../supabaseRest')
      expect(supabaseRestReloaded.isEnabled()).toBe(false)
    })
  })

  describe('delete', () => {
    it('should handle 204 No Content without error', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        status: 204,
        text: jest.fn().mockResolvedValue(''),
        json: jest.fn(),
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      // Act
      const result = await supabaseRest.delete('campgrounds', '?id=eq.test-id')

      // Assert
      expect(result).toBeNull()
      expect(mockResponse.json).not.toHaveBeenCalled()
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.supabase.co/rest/v1/campgrounds?id=eq.test-id',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            apikey: 'test-anon-key',
            Authorization: 'Bearer test-anon-key',
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('should handle 200 OK with JSON body when using Prefer header', async () => {
      // Arrange
      interface DeletedItem {
        id: string
        name: string
      }

      const deletedItem: DeletedItem = { id: 'test-id', name: 'Test Item' }
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue([deletedItem]),
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      // Act - Simulate delete with Prefer: return=representation
      const result = await supabaseRest.delete<DeletedItem[]>(
        'campgrounds',
        '?id=eq.test-id'
      )

      // Assert
      expect(result).toEqual([deletedItem])
      expect(mockResponse.json).toHaveBeenCalled()
    })

    it('should throw error for 4xx response', async () => {
      // Arrange
      const mockResponse = {
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue('Not Found'),
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      // Act & Assert
      await expect(
        supabaseRest.delete('campgrounds', '?id=eq.nonexistent')
      ).rejects.toThrow('Supabase REST error: 404 Not Found')
    })

    it('should throw error for 5xx response', async () => {
      // Arrange
      const mockResponse = {
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal Server Error'),
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      // Act & Assert
      await expect(
        supabaseRest.delete('campgrounds', '?id=eq.test-id')
      ).rejects.toThrow('Supabase REST error: 500 Internal Server Error')
    })
  })

  describe('select', () => {
    it('should parse JSON for successful GET requests', async () => {
      // Arrange
      interface SelectResult {
        id: string
        name: string
      }

      const expectedData: SelectResult[] = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ]
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(expectedData),
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      // Act
      const result = await supabaseRest.select<SelectResult[]>(
        'campgrounds',
        '?select=*'
      )

      // Assert
      expect(result).toEqual(expectedData)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.supabase.co/rest/v1/campgrounds?select=*',
        expect.objectContaining({
          headers: expect.objectContaining({
            apikey: 'test-anon-key',
            Authorization: 'Bearer test-anon-key',
          }),
        })
      )
    })

    it('should throw error for failed GET requests', async () => {
      // Arrange
      const mockResponse = {
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Bad Request'),
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      // Act & Assert
      await expect(
        supabaseRest.select('campgrounds', '?invalid=query')
      ).rejects.toThrow('Supabase REST error: 400 Bad Request')
    })
  })

  describe('insert', () => {
    it('should send POST request with correct headers and body', async () => {
      // Arrange
      interface InsertPayload {
        name: string
        email: string
      }

      interface InsertResult extends InsertPayload {
        id: string
        created_at: string
      }

      const payload: InsertPayload = { name: 'New Item', email: 'test@example.com' }
      const expectedResult: InsertResult = {
        ...payload,
        id: 'new-id',
        created_at: '2025-10-30T12:00:00Z',
      }
      const mockResponse = {
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue([expectedResult]),
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      // Act
      const result = await supabaseRest.insert<InsertResult[]>('campgrounds', payload)

      // Assert
      expect(result).toEqual([expectedResult])
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.supabase.co/rest/v1/campgrounds?select=*',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Prefer: 'return=representation',
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(payload),
        })
      )
    })
  })

  describe('upsert', () => {
    it('should send POST request with merge-duplicates preference', async () => {
      // Arrange
      interface UpsertPayload {
        id: string
        name: string
      }

      const payload: UpsertPayload = { id: 'existing-id', name: 'Updated Item' }
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue([payload]),
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      // Act
      const result = await supabaseRest.upsert<UpsertPayload[]>('campgrounds', payload)

      // Assert
      expect(result).toEqual([payload])
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.supabase.co/rest/v1/campgrounds?select=*',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Prefer: 'resolution=merge-duplicates,return=representation',
          }),
          body: JSON.stringify(payload),
        })
      )
    })
  })

  describe('update', () => {
    it('should send PATCH request with query parameters', async () => {
      // Arrange
      interface UpdatePayload {
        name: string
      }

      interface UpdateResult extends UpdatePayload {
        id: string
        updated_at: string
      }

      const payload: UpdatePayload = { name: 'Updated Name' }
      const expectedResult: UpdateResult = {
        ...payload,
        id: 'test-id',
        updated_at: '2025-10-30T12:00:00Z',
      }
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue([expectedResult]),
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      // Act
      const result = await supabaseRest.update<UpdateResult[]>(
        'campgrounds',
        payload,
        '?id=eq.test-id'
      )

      // Assert
      expect(result).toEqual([expectedResult])
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.supabase.co/rest/v1/campgrounds?id=eq.test-id&select=*',
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            Prefer: 'return=representation',
          }),
          body: JSON.stringify(payload),
        })
      )
    })
  })

  describe('URL formatting', () => {
    it('should handle SUPABASE_URL with trailing slash', async () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co/'
      jest.resetModules()
      const { supabaseRest: supabaseRestReloaded } = require('../supabaseRest')

      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue([]),
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      // Act
      await supabaseRestReloaded.select('campgrounds', '?select=*')

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.supabase.co/rest/v1/campgrounds?select=*',
        expect.any(Object)
      )
    })

    it('should handle SUPABASE_URL without trailing slash', async () => {
      // Arrange
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      jest.resetModules()
      const { supabaseRest: supabaseRestReloaded } = require('../supabaseRest')

      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue([]),
      }
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      // Act
      await supabaseRestReloaded.select('campgrounds', '?select=*')

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.supabase.co/rest/v1/campgrounds?select=*',
        expect.any(Object)
      )
    })
  })
})
