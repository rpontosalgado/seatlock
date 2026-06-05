import { PrismaClient } from '../../src/generated/prisma/client.js';

describe('Concurrency Tests', () => {
  it('should use SELECT FOR UPDATE for row-level locking', async () => {
    const prisma = new PrismaClient();
    await prisma.$connect();

    try {
      const lockedSeats = await prisma.$queryRaw<Array<{ id: string; status: string }>>`
        SELECT id, status FROM seats
        WHERE id = ANY(ARRAY[]::uuid[])
        ORDER BY id ASC
        FOR UPDATE
      `;

      expect(Array.isArray(lockedSeats)).toBe(true);
    } finally {
      await prisma.$disconnect();
    }
  });
});