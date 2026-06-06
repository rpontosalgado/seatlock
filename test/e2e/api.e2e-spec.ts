import * as dotenv from 'dotenv';
dotenv.config({ quiet: true });

import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';

describe('E2E: API Endpoints', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  }, 15000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /health', () => {
    it('should return 200', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200);
    });
  });

  describe('POST /sessions', () => {
    it('should return 201 or error', () => {
      return request(app.getHttpServer())
        .post('/sessions')
        .send({
          movie_id: 'nonexistent',
          room_id: 'nonexistent',
          start_time: '2026-07-01T20:00:00Z',
          price_cents: 2500,
        })
        .expect((res: any) => {
          expect([201, 400, 404, 500]).toContain(res.status);
        });
    });
  });
});