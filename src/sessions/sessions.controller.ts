import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(@Body() dto: CreateSessionDto) {
    return this.sessionsService.create({
      ...dto,
      start_time: new Date(dto.start_time),
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionsService.findById(id);
  }

  @Get(':id/seats')
  findSeats(@Param('id') id: string) {
    return this.sessionsService.findSeats(id);
  }
}