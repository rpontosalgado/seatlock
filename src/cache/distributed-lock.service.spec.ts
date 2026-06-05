import { Test } from '@nestjs/testing';
import { DistributedLockService } from './distributed-lock.service';
import { RedisService } from './redis.service';

describe('DistributedLockService', () => {
  let service: DistributedLockService;
  let redisService: RedisService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DistributedLockService,
        {
          provide: RedisService,
          useValue: {
            getClient: jest.fn().mockReturnValue({
              set: jest.fn(),
              del: jest.fn(),
              on: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<DistributedLockService>(DistributedLockService);
    redisService = module.get<RedisService>(RedisService);
  });

  describe('acquireLock', () => {
    it('should be defined', () => {
      expect(service.acquireLock).toBeDefined();
    });
  });

  describe('releaseLock', () => {
    it('should be defined', () => {
      expect(service.releaseLock).toBeDefined();
    });
  });
});