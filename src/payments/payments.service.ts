import { Injectable, ConflictException, GoneException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ReservationStatus, SeatStatus } from '../database/prisma.types';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async confirm(reservationId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation ${reservationId} not found`);
    }

    if (reservation.status === ReservationStatus.confirmed) {
      return this.prisma.sale.findUnique({
        where: { reservation_id: reservationId },
      });
    }

    if (reservation.status === ReservationStatus.expired) {
      throw new GoneException('Reservation has expired');
    }

    if (reservation.status === ReservationStatus.cancelled) {
      throw new ConflictException('Reservation was cancelled');
    }

    if (new Date(reservation.expires_at) < new Date()) {
      throw new GoneException('Reservation has expired');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: ReservationStatus.confirmed },
      });

      await tx.seat.update({
        where: { id: reservation.seat_id },
        data: { status: SeatStatus.sold },
      });

      const sale = await tx.sale.create({
        data: {
          reservation_id: reservationId,
          seat_id: reservation.seat_id,
          user_id: reservation.user_id,
          amount_cents: 0,
        },
      });

      return sale;
    });
  }

  async findPurchasesByUserId(userId: string) {
    return this.prisma.sale.findMany({
      where: { user_id: userId },
      include: { reservation: true, seat: true },
    });
  }
}