import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

const SEAT_ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const SEATS_PER_ROW = 10;

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    movie_id: string;
    room_id: string;
    start_time: Date;
    price_cents: number;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const session = await tx.session.create({
        data: {
          movie_id: data.movie_id,
          room_id: data.room_id,
          start_time: data.start_time,
          price_cents: data.price_cents,
        },
      });

      const seatData: { session_id: string; row_label: string; seat_number: number }[] = [];
      for (const row of SEAT_ROWS) {
        for (let num = 1; num <= SEATS_PER_ROW; num++) {
          seatData.push({
            session_id: session.id,
            row_label: row,
            seat_number: num,
          });
        }
      }

      await tx.seat.createMany({ data: seatData });

      return session;
    });
  }

  async findById(id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: { movie: true, room: true },
    });

    if (!session) {
      throw new NotFoundException(`Session ${id} not found`);
    }

    return session;
  }

  async findSeats(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }

    return this.prisma.seat.findMany({
      where: { session_id: sessionId },
      orderBy: [{ row_label: 'asc' }, { seat_number: 'asc' }],
    });
  }
}