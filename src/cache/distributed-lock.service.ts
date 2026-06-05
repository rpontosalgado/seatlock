import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class DistributedLockService {
  private readonly logger = new Logger(DistributedLockService.name);

  constructor(private redisService: RedisService) {}

  async acquireLock(seatId: string, reservationId: string, ttlSeconds: number = 35): Promise<boolean> {
    const client = this.redisService.getClient();
    const key = `seat:${seatId}`;
    const result: string | null = await client.sendCommand(
      { name: 'SET', args: [key, reservationId, 'NX', 'EX', String(ttlSeconds)] } as any,
    ) as string | null;
    this.logger.debug(`acquireLock(${key}, ${reservationId}, ${ttlSeconds}s) → ${result}`);
    return result === 'OK';
  }

  async releaseLock(seatId: string): Promise<number> {
    const client = this.redisService.getClient();
    const key = `seat:${seatId}`;
    const result = await client.del(key);
    this.logger.debug(`releaseLock(${key}) → deleted ${result} key(s)`);
    return result;
  }
}