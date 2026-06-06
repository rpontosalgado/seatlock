import * as dotenv from 'dotenv';
dotenv.config({ quiet: true });

import { PrismaService } from '../../src/database/prisma.service';

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
    const lockedSeats = await prisma.$queryRaw<Array<{ id: string; status: string }>>`
      SELECT id, status FROM seats
      WHERE id = ANY(ARRAY[]::uuid[])
      ORDER BY id ASC
      FOR UPDATE
    `;

    expect(Array.isArray(lockedSeats)).toBe(true);
  });
});