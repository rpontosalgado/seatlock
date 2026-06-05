import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  confirm(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.confirm(dto.reservation_id);
  }
}

@Controller('users')
export class UsersController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get(':id/purchases')
  findPurchases(@Param('id') id: string) {
    return this.paymentsService.findPurchasesByUserId(id);
  }
}