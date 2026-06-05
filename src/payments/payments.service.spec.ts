import { Test } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../database/prisma.service';
import { PrismaModule } from '../database/prisma.module';

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [PaymentsService],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  describe('confirm', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('findPurchasesByUserId', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });
});