import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient();

async function main() {
  const movie = await prisma.movie.create({
    data: {
      title: 'Inception',
      duration_minutes: 148,
    },
  });

  const room = await prisma.room.create({
    data: {
      name: 'Sala 1',
    },
  });

  const session = await prisma.session.create({
    data: {
      movie_id: movie.id,
      room_id: room.id,
      start_time: new Date('2026-07-01T20:00:00Z'),
      price_cents: 2500,
    },
  });

  const rows = ['A', 'B', 'C', 'D'];
  const seatsPerRow = 8;

  for (const row of rows) {
    for (let num = 1; num <= seatsPerRow; num++) {
      await prisma.seat.create({
        data: {
          session_id: session.id,
          row_label: row,
          seat_number: num,
        },
      });
    }
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });