import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { ReservationCreatedProducer } from './producers/reservation-created.producer';
import { SaleConfirmedProducer } from './producers/sale-confirmed.producer';
import { ReservationExpiredProducer } from './producers/reservation-expired.producer';
import { SeatReleasedProducer } from './producers/seat-released.producer';

@Module({
  providers: [
    EventsService,
    ReservationCreatedProducer,
    SaleConfirmedProducer,
    ReservationExpiredProducer,
    SeatReleasedProducer,
  ],
  exports: [
    EventsService,
    ReservationCreatedProducer,
    SaleConfirmedProducer,
    ReservationExpiredProducer,
    SeatReleasedProducer,
  ],
})
export class EventsModule {}