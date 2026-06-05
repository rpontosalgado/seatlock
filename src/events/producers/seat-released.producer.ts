import { Injectable } from '@nestjs/common';
import { EventsService } from '../events.service';

@Injectable()
export class SeatReleasedProducer {
  constructor(private eventsService: EventsService) {}

  async publish(data: {
    seat_id: string;
    session_id: string;
    reservation_id: string;
  }) {
    await this.eventsService.emit('seat.released', data.seat_id, data);
  }
}