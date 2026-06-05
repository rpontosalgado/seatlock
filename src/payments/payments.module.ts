import { Module } from '@nestjs/common';
import { PaymentsController, UsersController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  controllers: [PaymentsController, UsersController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}