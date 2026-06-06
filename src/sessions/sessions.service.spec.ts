import { Test } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { PrismaService } from '../database/prisma.service';
import { createMockPrismaService } from '../database/testing/mocks';

describe('SessionsService', () => {
  let service: SessionsService;
  let prisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module = await Test.createTestingModule({
      providers: [
        SessionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a session with seats', async () => {
      prisma.session.create.mockResolvedValue({ id: 'session-1' });
      prisma.seat.createMany.mockResolvedValue({ count: 80 });

      prisma.$transaction.mockImplementation(async (fn: any) => fn(prisma));

      const result = await service.create({
        movie_id: 'movie-1',
        room_id: 'room-1',
        start_time: new Date(),
        price_cents: 2500,
      });

      expect(result).toEqual({ id: 'session-1' });
    });
  });

  describe('findById', () => {
    it('should return a session', async () => {
      prisma.session.findUnique.mockResolvedValue({ id: 'session-1', movie: {}, room: {} });

      const result = await service.findById('session-1');
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if session not found', async () => {
      prisma.session.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow('Session nonexistent not found');
    });
  });
});