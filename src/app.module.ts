import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { SessionsModule } from './sessions/sessions.module';
import { ReservationsModule } from './reservations/reservations.module';
import { PaymentsModule } from './payments/payments.module';
import { ExpiryWorkerModule } from './expiry-worker/expiry-worker.module';
import { HealthModule } from './health/health.module';
import { CacheModule } from './cache/cache.module';
import { EventsModule } from './events/events.module';
import { LoggerModule } from './logger/logger.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import kafkaConfig from './config/kafka.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, kafkaConfig],
    }),
    PrismaModule,
    CacheModule,
    SessionsModule,
    ReservationsModule,
    PaymentsModule,
    ExpiryWorkerModule,
    EventsModule,
    HealthModule,
    LoggerModule,
  ],
})
export class AppModule {}