import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(@Body() dto: CreateReservationDto) {
    return this.reservationsService.reserve(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findById(id);
  }

  @Delete(':id')
  cancel(@Param('id') id: string) {
    return this.reservationsService.cancel(id);
  }
}