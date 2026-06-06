import { Test } from '@nestjs/testing';
import { ExpiryWorkerService } from './expiry-worker.service';
import { PrismaService } from '../database/prisma.service';
import { DistributedLockService } from '../cache/distributed-lock.service';
import { createMockPrismaService, createMockDistributedLockService } from '../database/testing/mocks';

describe('ExpiryWorkerService', () => {
  let service: ExpiryWorkerService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    const lockService = createMockDistributedLockService();

    const module = await Test.createTestingModule({
      providers: [
        ExpiryWorkerService,
        { provide: PrismaService, useValue: prisma },
        { provide: DistributedLockService, useValue: lockService },
      ],
    }).compile();

    service = module.get<ExpiryWorkerService>(ExpiryWorkerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sweepExpiredReservations', () => {
    it('should return empty array when no expired reservations', async () => {
      prisma.reservation.findMany.mockResolvedValue([]);

      const result = await service.sweepExpiredReservations();
      expect(result).toEqual([]);
    });

    it('should process expired reservations', async () => {
      const expired = [{ id: 'res-1', seat_id: 'seat-1' }];
      prisma.reservation.findMany.mockResolvedValue(expired);
      prisma.$transaction.mockImplementation(async (fn: any) => fn(prisma));
      prisma.reservation.update.mockResolvedValue({ id: 'res-1', status: 'expired' });
      prisma.seat.update.mockResolvedValue({ id: 'seat-1', status: 'available' });

      const result = await service.sweepExpiredReservations();
      expect(result).toEqual(expired);
    });
  });
});