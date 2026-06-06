import { Injectable, ConflictException, GoneException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { DistributedLockService } from '../cache/distributed-lock.service';
import { SeatStatus, ReservationStatus } from '../database/prisma.types';

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaService,
    private lockService: DistributedLockService,
  ) {}

  async reserve(data: {
    session_id: string;
    seat_ids: string[];
    user_id: string;
    idempotency_key: string;
  }) {
    const existing = await this.prisma.reservation.findUnique({
      where: {
        user_id_session_id_idempotency_key: {
          user_id: data.user_id,
          session_id: data.session_id,
          idempotency_key: data.idempotency_key,
        },
      },
    });

    if (existing) {
      return { reservation: existing, is_idempotent: true };
    }

    const sortedSeatIds = [...data.seat_ids].sort();

    const acquiredLocks: string[] = [];
    for (const seatId of sortedSeatIds) {
      const acquired = await this.lockService.acquireLock(seatId, `reserve-${data.user_id}`, 35);
      if (!acquired) {
        for (const lockId of acquiredLocks.reverse()) {
          await this.lockService.releaseLock(lockId);
        }
        throw new ConflictException(`Seat ${seatId} is currently being reserved by another user`);
      }
      acquiredLocks.push(seatId);
    }

    try {
      const expiresAt = new Date(Date.now() + 30_000);

      const reservation = await this.prisma.$transaction(async (tx) => {
        const lockedSeats = await tx.$queryRawUnsafe<Array<{ id: string; status: string }>>(
          `SELECT id, status FROM seats
           WHERE id::text = ANY($1::text[])
           ORDER BY id ASC
           FOR UPDATE`,
          sortedSeatIds,
        );

        for (const seat of lockedSeats) {
          if (seat.status !== SeatStatus.available) {
            throw new ConflictException(`Seat ${seat.id} is not available (status: ${seat.status})`);
          }
        }

        if (lockedSeats.length !== data.seat_ids.length) {
          throw new NotFoundException('One or more seats not found');
        }

        const reservation = await tx.reservation.create({
          data: {
            seat_id: data.seat_ids[0],
            user_id: data.user_id,
            session_id: data.session_id,
            idempotency_key: data.idempotency_key,
            status: ReservationStatus.pending,
            expires_at: expiresAt,
          },
        });

        await tx.seat.updateMany({
          where: { id: { in: data.seat_ids } },
          data: { status: SeatStatus.reserved },
        });

        return reservation;
      });

      return { reservation, is_idempotent: false };
    } finally {
      for (const seatId of sortedSeatIds) {
        await this.lockService.releaseLock(seatId);
      }
    }
  }

  async findById(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { seat: true },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation ${id} not found`);
    }

    return reservation;
  }

  async cancel(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation ${id} not found`);
    }

    if (reservation.status !== ReservationStatus.pending) {
      throw new ConflictException(
        `Cannot cancel reservation with status ${reservation.status}`,
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.reservation.update({
        where: { id },
        data: { status: ReservationStatus.cancelled },
      });

      await tx.seat.update({
        where: { id: reservation.seat_id },
        data: { status: SeatStatus.available },
      });

      return updated;
    });

    await this.lockService.releaseLock(reservation.seat_id);

    return result;
  }
}