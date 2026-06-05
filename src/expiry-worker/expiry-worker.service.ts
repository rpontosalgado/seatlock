import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { DistributedLockService } from '../cache/distributed-lock.service';
import { ReservationStatus, SeatStatus } from '../database/prisma.types';

@Injectable()
export class ExpiryWorkerService {
  private readonly logger = new Logger(ExpiryWorkerService.name);

  constructor(
    private prisma: PrismaService,
    private lockService: DistributedLockService,
  ) {}

  async sweepExpiredReservations() {
    const expired = await this.prisma.reservation.findMany({
      where: {
        status: ReservationStatus.pending,
        expires_at: { lt: new Date() },
      },
    });

    if (expired.length === 0) {
      return [];
    }

    this.logger.log(`Found ${expired.length} expired reservation(s) to process`);

    for (const reservation of expired) {
      await this.prisma.$transaction(async (tx) => {
        await tx.reservation.update({
          where: { id: reservation.id },
          data: { status: ReservationStatus.expired },
        });

        await tx.seat.update({
          where: { id: reservation.seat_id },
          data: { status: SeatStatus.available },
        });
      });

      await this.lockService.releaseLock(reservation.seat_id);

      this.logger.log(
        `Expired reservation ${reservation.id}, released seat ${reservation.seat_id}`,
      );
    }

    return expired;
  }
}