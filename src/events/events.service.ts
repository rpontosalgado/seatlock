import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Admin } from 'kafkajs';

const TOPICS = [
  'reservation.created',
  'sale.confirmed',
  'reservation.expired',
  'seat.released',
];

const DLQ_TOPICS = TOPICS.map((t) => `${t}.dlq`);

@Injectable()
export class EventsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventsService.name);
  private kafka: Kafka;
  private producer: Producer;
  private admin: Admin;
  private connected = false;

  constructor(private configService: ConfigService) {
    const brokersRaw = this.configService.get<string | string[]>('kafka.brokers', 'localhost:9092');
    const brokers = Array.isArray(brokersRaw) ? brokersRaw : brokersRaw.split(',');
    this.kafka = new Kafka({
      brokers,
      connectionTimeout: 3000,
      requestTimeout: 5000,
    });
    this.producer = this.kafka.producer();
    this.admin = this.kafka.admin();
  }

  async onModuleInit() {
    try {
      await this.admin.connect();
      await this.admin.createTopics({
        topics: [...TOPICS, ...DLQ_TOPICS].map((topic) => ({
          topic,
          numPartitions: 1,
          replicationFactor: 1,
        })),
        waitForLeaders: true,
      });
      await this.admin.disconnect();
      await this.producer.connect();
      this.connected = true;
      this.logger.log('Kafka producer connected');
    } catch (error) {
      this.logger.warn('Kafka unavailable - events will be logged but not published');
      this.connected = false;
    }
  }

  async onModuleDestroy() {
    if (this.connected) {
      await this.producer.disconnect();
    }
  }

  async emit(topic: string, key: string, value: Record<string, unknown>) {
    if (!this.connected) {
      this.logger.debug(`Kafka unavailable - skipping event to ${topic}: ${key}`);
      return;
    }
    await this.producer.send({
      topic,
      messages: [{ key, value: JSON.stringify(value) }],
    });
    this.logger.debug(`Event published to ${topic}: ${key}`);
  }
}