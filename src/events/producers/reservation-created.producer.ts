import { Injectable } from '@nestjs/common';
import { EventsService } from '../events.service';

@Injectable()
export class ReservationCreatedProducer {
  constructor(private eventsService: EventsService) {}

  async publish(data: {
    reservation_id: string;
    session_id: string;
    seat_ids: string[];
    user_id: string;
    expires_at: string;
  }) {
    await this.eventsService.emit('reservation.created', data.reservation_id, data);
  }
}