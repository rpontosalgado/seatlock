import { Injectable } from '@nestjs/common';
import { EventsService } from '../events.service';

@Injectable()
export class ReservationExpiredProducer {
  constructor(private eventsService: EventsService) {}

  async publish(data: {
    reservation_id: string;
    session_id: string;
    seat_ids: string[];
  }) {
    await this.eventsService.emit('reservation.expired', data.reservation_id, data);
  }
}