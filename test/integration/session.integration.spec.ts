import * as dotenv from 'dotenv';
dotenv.config({ quiet: true });

import { PrismaService } from '../../src/database/prisma.service';

describe('Integration: Session', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    await prisma.sale.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.seat.deleteMany();
    await prisma.session.deleteMany();
    await prisma.room.deleteMany();
    await prisma.movie.deleteMany();
  });

  it('should create a session and verify persistence', async () => {
    const movie = await prisma.movie.create({
      data: { title: 'Test Movie', duration_minutes: 120 },
    });
    const room = await prisma.room.create({
      data: { name: 'Room A' },
    });
    const session = await prisma.session.create({
      data: {
        movie_id: movie.id,
        room_id: room.id,
        start_time: new Date(),
        price_cents: 2500,
      },
    });

    expect(session).toBeDefined();
    expect(session.id).toBeDefined();
  });
});