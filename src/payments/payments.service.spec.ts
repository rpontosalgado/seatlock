import { Test } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../database/prisma.service';
import { createMockPrismaService } from '../database/testing/mocks';
import { NotFoundException, GoneException, ConflictException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('confirm', () => {
    it('should throw NotFoundException if reservation not found', async () => {
      prisma.reservation.findUnique.mockResolvedValue(null);

      await expect(service.confirm('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw GoneException if reservation expired', async () => {
      prisma.reservation.findUnique.mockResolvedValue({ id: 'r-1', status: 'expired', expires_at: new Date() });

      await expect(service.confirm('r-1')).rejects.toThrow(GoneException);
    });

    it('should throw ConflictException if reservation cancelled', async () => {
      prisma.reservation.findUnique.mockResolvedValue({ id: 'r-1', status: 'cancelled', expires_at: new Date() });

      await expect(service.confirm('r-1')).rejects.toThrow(ConflictException);
    });
  });

  describe('findPurchasesByUserId', () => {
    it('should return sales for a user', async () => {
      prisma.sale.findMany.mockResolvedValue([{ id: 'sale-1' }]);

      const result = await service.findPurchasesByUserId('u-1');
      expect(result).toEqual([{ id: 'sale-1' }]);
    });
  });
});