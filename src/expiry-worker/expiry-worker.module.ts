import { Module } from '@nestjs/common';
import { ExpiryWorkerService } from './expiry-worker.service';

@Module({
  providers: [ExpiryWorkerService],
  exports: [ExpiryWorkerService],
})
export class ExpiryWorkerModule {}