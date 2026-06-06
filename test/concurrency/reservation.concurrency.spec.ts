import * as dotenv from 'dotenv';
dotenv.config({ quiet: true });

import { PrismaService } from '../../src/database/prisma.service';
import { Prisma } from '../../src/database/prisma.types';

describe('Concurrency Tests', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should use SELECT FOR UPDATE for row-level locking', async () => {
    const movie = await prisma.movie.create({
      data: { title: 'Concurrency Test Movie', duration_minutes: 120 },
    });
    const room = await prisma.room.create({
      data: { name: 'Concurrency Test Room' },
    });
    const session = await prisma.session.create({
      data: {
        movie_id: movie.id,
        room_id: room.id,
        start_time: new Date(),
        price_cents: 2500,
      },
    });

    const seat = await prisma.seat.create({
      data: {
        session_id: session.id,
        row_label: 'A',
        seat_number: 1,
      },
    });

    try {
      const lockedSeats = await prisma.$queryRawUnsafe<Array<{ id: string; status: string }>>(
        `SELECT id, status FROM seats
         WHERE id::text = ANY($1::text[])
         ORDER BY id ASC
         FOR UPDATE`,
        [seat.id],
      );

      expect(Array.isArray(lockedSeats)).toBe(true);
      expect(lockedSeats.length).toBe(1);
      expect(lockedSeats[0].id).toBe(seat.id);
    } finally {
      await prisma.sale.deleteMany();
      await prisma.reservation.deleteMany();
      await prisma.seat.deleteMany();
      await prisma.session.deleteMany();
      await prisma.room.deleteMany();
      await prisma.movie.deleteMany();
    }
  });
});