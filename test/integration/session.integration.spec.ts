import { Test } from '@nestjs/testing';
import { PrismaClient } from '../../src/generated/prisma/client.js';
import { PrismaService } from '../../src/database/prisma.service';
import { SessionsService } from '../../src/sessions/sessions.service';
import { ReservationsService } from '../../src/reservations/reservations.service';
import { PaymentsService } from '../../src/payments/payments.service';

describe('Integration Tests', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
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
    await prisma.movie.deleteMany();
    await prisma.room.deleteMany();
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