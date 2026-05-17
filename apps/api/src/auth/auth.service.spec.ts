import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service'
import { Neo4jService } from '../neo4j/neo4j.service'

describe('AuthService', () => {
  let service: AuthService
  let neo4jService: Neo4jService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: Neo4jService,
          useValue: {
            runQuery: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    neo4jService = module.get<Neo4jService>(Neo4jService)
  })

  describe('generateKey', () => {
    const mockQueryResult = {
      records: [],
      summary: { counters: { nodesCreated: 1 } },
    } as any

    it('should generate a key with prefix', async () => {
      jest.spyOn(neo4jService, 'runQuery').mockResolvedValue(mockQueryResult)

      const result = await service.generateKey('test-label')

      expect(result.key).toMatch(/^kb_live_[a-f0-9]{32}$/)
      expect(result.label).toBe('test-label')
      expect(result.id).toBeDefined()
      expect(neo4jService.runQuery).toHaveBeenCalledWith(
        expect.stringContaining('key_prefix'),
        expect.objectContaining({ keyPrefix: result.key.substring(0, 15) }),
      )
    })

    it('should create key with expiration if provided', async () => {
      jest.spyOn(neo4jService, 'runQuery').mockResolvedValue(mockQueryResult)

      await service.generateKey('test', '7d')

      expect(neo4jService.runQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          expiresAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}/),
        }),
      )
    })
  })

  describe('validateKey', () => {
    const mockQueryResult = {
      records: [],
      summary: { counters: {} },
    } as any

    it('should validate correct key using prefix lookup', async () => {
      const rawKey = 'kb_live_144dd2a06e7148236aee1d38bc60a44c'
      const keyPrefix = rawKey.substring(0, 15)

      const mockRecord = {
        get: jest.fn((key: string) => {
          if (key === 'id') return '123'
          if (key === 'hash') return '$2b$10$mock'
          return undefined
        }),
      } as any

      jest.spyOn(neo4jService, 'runQuery').mockResolvedValue({
        records: [mockRecord],
        summary: { counters: {} },
      } as any)

      const isValid = await service.validateKey(rawKey)

      // Verify prefix-based query
      expect(neo4jService.runQuery).toHaveBeenCalledWith(
        expect.stringContaining('key_prefix: $keyPrefix'),
        expect.objectContaining({ keyPrefix }),
      )
    })

    it('should query with prefix filter for performance', async () => {
      const rawKey = 'kb_live_abc123def456'
      const keyPrefix = rawKey.substring(0, 15)

      jest.spyOn(neo4jService, 'runQuery').mockResolvedValue(mockQueryResult)

      await service.validateKey(rawKey)

      const callArgs = (neo4jService.runQuery as jest.Mock).mock.calls[0]
      expect(callArgs[0]).toContain('MATCH (k:ApiKey { active: true, key_prefix: $keyPrefix })')
      expect(callArgs[1]).toEqual(expect.objectContaining({ keyPrefix }))
    })

    it('should return false for invalid key', async () => {
      jest.spyOn(neo4jService, 'runQuery').mockResolvedValue(mockQueryResult)

      const isValid = await service.validateKey('kb_live_invalid')

      expect(isValid).toBe(false)
    })
  })

  describe('revokeKey', () => {
    it('should revoke a key', async () => {
      const mockQueryResult = {
        records: [],
        summary: { counters: {} },
      } as any

      jest.spyOn(neo4jService, 'runQuery').mockResolvedValue(mockQueryResult)

      await service.revokeKey('key-id-123')

      expect(neo4jService.runQuery).toHaveBeenCalledWith(
        expect.stringContaining('SET k.active = false'),
        expect.objectContaining({ id: 'key-id-123' }),
      )
    })
  })

  describe('listKeys', () => {
    it('should list all keys masked', async () => {
      const mockRecord = {
        get: jest.fn(
          (key: string) => ({
            properties: {
              id: '123',
              label: 'test-key',
              active: true,
              created_at: '2026-05-17T00:00:00Z',
              use_count: 5,
            },
          } as any),
        ),
      } as any

      jest.spyOn(neo4jService, 'runQuery').mockResolvedValue({
        records: [mockRecord],
        summary: { counters: {} },
      } as any)

      const keys = await service.listKeys()

      expect(keys).toHaveLength(1)
      expect(keys[0].key_masked).toBe('kb_live_xxxx...xxxx')
      expect(keys[0].label).toBe('test-key')
    })
  })
})
