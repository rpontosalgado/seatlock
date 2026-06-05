import { Injectable } from '@nestjs/common';
import { EventsService } from '../events.service';

@Injectable()
export class SaleConfirmedProducer {
  constructor(private eventsService: EventsService) {}

  async publish(data: {
    sale_id: string;
    reservation_id: string;
    seat_id: string;
    user_id: string;
    confirmed_at: string;
  }) {
    await this.eventsService.emit('sale.confirmed', data.sale_id, data);
  }
}