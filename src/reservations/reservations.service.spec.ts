import { Test } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../database/prisma.service';
import { DistributedLockService } from '../cache/distributed-lock.service';
import { createMockPrismaService, createMockDistributedLockService } from '../database/testing/mocks';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let prisma: ReturnType<typeof createMockPrismaService>;
  let lockService: ReturnType<typeof createMockDistributedLockService>;

  beforeEach(async () => {
    prisma = createMockPrismaService();
    lockService = createMockDistributedLockService();

    const module = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: DistributedLockService, useValue: lockService },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('reserve', () => {
    it('should return existing reservation for idempotent request', async () => {
      const existing = { id: 'res-1', status: 'pending' };
      prisma.reservation.findUnique.mockResolvedValue(existing);

      const result = await service.reserve({
        session_id: 's-1',
        seat_ids: ['seat-1'],
        user_id: 'u-1',
        idempotency_key: 'key-1',
      });

      expect(result).toEqual({ reservation: existing, is_idempotent: true });
    });

    it('should throw ConflictException if lock cannot be acquired', async () => {
      prisma.reservation.findUnique.mockResolvedValue(null);
      lockService.acquireLock.mockResolvedValue(false);

      await expect(
        service.reserve({
          session_id: 's-1',
          seat_ids: ['seat-1'],
          user_id: 'u-1',
          idempotency_key: 'key-1',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findById', () => {
    it('should return a reservation', async () => {
      prisma.reservation.findUnique.mockResolvedValue({ id: 'res-1', seat: {} });

      const result = await service.findById('res-1');
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if reservation not found', async () => {
      prisma.reservation.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancel', () => {
    it('should throw NotFoundException if reservation not found', async () => {
      prisma.reservation.findUnique.mockResolvedValue(null);

      await expect(service.cancel('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if reservation is not pending', async () => {
      prisma.reservation.findUnique.mockResolvedValue({ id: 'res-1', status: 'confirmed', seat_id: 'seat-1' });

      await expect(service.cancel('res-1')).rejects.toThrow(ConflictException);
    });
  });
});