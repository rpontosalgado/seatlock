import { Test } from '@nestjs/testing';
import { ExpiryWorkerService } from './expiry-worker.service';
import { PrismaService } from '../database/prisma.service';
import { DistributedLockService } from '../cache/distributed-lock.service';
import { ReservationStatus } from '../database/prisma.types';
import { PrismaModule } from '../database/prisma.module';
import { CacheModule } from '../cache/cache.module';

describe('ExpiryWorkerService', () => {
  let service: ExpiryWorkerService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [PrismaModule, CacheModule],
      providers: [ExpiryWorkerService],
    }).compile();

    service = module.get<ExpiryWorkerService>(ExpiryWorkerService);
  });

  describe('sweepExpiredReservations', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });
});