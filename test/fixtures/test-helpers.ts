import { PrismaClient } from '../../src/generated/prisma/client.js';

export const prisma = new PrismaClient();

export async function seedMovie(title = 'Test Movie', durationMinutes = 120) {
  return prisma.movie.create({
    data: { title, duration_minutes: durationMinutes },
  });
}

export async function seedRoom(name = 'Room A') {
  return prisma.room.create({ data: { name } });
}

export async function seedSession(movieId: string, roomId: string, priceCents = 2500) {
  const session = await prisma.session.create({
    data: {
      movie_id: movieId,
      room_id: roomId,
      start_time: new Date('2026-07-01T20:00:00Z'),
      price_cents: priceCents,
    },
  });

  const rows = ['A', 'B', 'C', 'D'];
  const seatsPerRow = 8;
  const seatData = [];
  for (const row of rows) {
    for (let num = 1; num <= seatsPerRow; num++) {
      seatData.push({
        session_id: session.id,
        row_label: row,
        seat_number: num,
      });
    }
  }
  await prisma.seat.createMany({ data: seatData });

  return session;
}

export async function cleanup() {
  await prisma.sale.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.session.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.room.deleteMany();
}