import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaModule } from '../../src/database/prisma.module';
import { SessionsModule } from '../../src/sessions/sessions.module';
import { ReservationsModule } from '../../src/reservations/reservations.module';
import { PaymentsModule } from '../../src/payments/payments.module';
import { CacheModule } from '../../src/cache/cache.module';
import { ConfigModule } from '@nestjs/config';
import appConfig from '../../src/config/app.config';
import databaseConfig from '../../src/config/database.config';
import redisConfig from '../../src/config/redis.config';

describe('Integration: Reservation Flow (reserve → confirm → verify)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfig, databaseConfig, redisConfig],
        }),
        PrismaModule,
        CacheModule,
        SessionsModule,
        ReservationsModule,
        PaymentsModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });
});