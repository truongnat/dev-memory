import { Test, TestingModule } from '@nestjs/testing'
import { CacheService } from './cache.service'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

jest.mock('ioredis')

describe('CacheService', () => {
  let service: CacheService
  let mockRedis: jest.Mocked<Redis>

  beforeEach(async () => {
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      scan: jest.fn(),
      pipeline: jest.fn(),
      on: jest.fn(),
      quit: jest.fn(),
    } as any

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'REDIS_HOST') return 'localhost'
              if (key === 'REDIS_PORT') return 6379
              if (key === 'REDIS_PASSWORD') return 'test'
            }),
          },
        },
      ],
    }).compile()

    service = module.get<CacheService>(CacheService)
    ;(service as any).client = mockRedis
  })

  describe('get', () => {
    it('should retrieve cached value', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify({ test: 'data' }))

      const result = await service.get('key')

      expect(result).toEqual({ test: 'data' })
      expect(mockRedis.get).toHaveBeenCalledWith('key')
    })

    it('should return null if key does not exist', async () => {
      mockRedis.get.mockResolvedValue(null)

      const result = await service.get('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('set', () => {
    it('should set cache value with TTL', async () => {
      mockRedis.set.mockResolvedValue('OK')

      await service.set('key', { test: 'data' }, 300)

      expect(mockRedis.set).toHaveBeenCalledWith(
        'key',
        JSON.stringify({ test: 'data' }),
        'EX',
        300,
      )
    })

    it('should use default TTL if not provided', async () => {
      mockRedis.set.mockResolvedValue('OK')

      await service.set('key', { test: 'data' })

      expect(mockRedis.set).toHaveBeenCalledWith(
        'key',
        expect.any(String),
        'EX',
        300,
      )
    })
  })

  describe('del', () => {
    it('should delete a key', async () => {
      mockRedis.del.mockResolvedValue(1)

      await service.del('key')

      expect(mockRedis.del).toHaveBeenCalledWith('key')
    })
  })

  describe('delByPattern', () => {
    it('should use SCAN instead of KEYS for non-blocking deletion', async () => {
      const mockPipeline = {
        del: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      }

      mockRedis.pipeline.mockReturnValue(mockPipeline as any)
      mockRedis.scan.mockResolvedValueOnce(['100', ['key:1', 'key:2']])
      mockRedis.scan.mockResolvedValueOnce(['0', ['key:3']])

      await service.delByPattern('key:*')

      // Verify SCAN was used instead of KEYS
      expect(mockRedis.scan).toHaveBeenCalled()
      expect(mockRedis.pipeline).toHaveBeenCalled()

      // Verify deletion was pipelined
      expect(mockPipeline.del).toHaveBeenCalledWith('key:1')
      expect(mockPipeline.del).toHaveBeenCalledWith('key:2')
      expect(mockPipeline.del).toHaveBeenCalledWith('key:3')
      expect(mockPipeline.exec).toHaveBeenCalled()
    })

    it('should handle cursor iteration until 0', async () => {
      const mockPipeline = {
        del: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      }

      mockRedis.pipeline.mockReturnValue(mockPipeline as any)

      // Simulate SCAN with multiple iterations
      mockRedis.scan
        .mockResolvedValueOnce(['1', ['key:1']])
        .mockResolvedValueOnce(['2', ['key:2']])
        .mockResolvedValueOnce(['0', ['key:3']])

      await service.delByPattern('search:*')

      // Verify all iterations happened
      expect(mockRedis.scan).toHaveBeenCalledTimes(3)
      expect(mockPipeline.exec).toHaveBeenCalled()
    })

    it('should handle empty pattern results', async () => {
      const mockPipeline = {
        del: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      }

      mockRedis.pipeline.mockReturnValue(mockPipeline as any)
      mockRedis.scan.mockResolvedValueOnce(['0', []])

      await service.delByPattern('nonexistent:*')

      expect(mockPipeline.exec).toHaveBeenCalled()
      expect(mockPipeline.del).not.toHaveBeenCalled()
    })
  })
})
