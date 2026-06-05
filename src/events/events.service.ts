import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Admin, Consumer } from 'kafkajs';

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

  constructor(private configService: ConfigService) {
    const brokers = this.configService.get<string>('kafka.brokers', 'localhost:9092').split(',');
    this.kafka = new Kafka({ brokers });
    this.producer = this.kafka.producer();
    this.admin = this.kafka.admin();
  }

  async onModuleInit() {
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
    this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async emit(topic: string, key: string, value: Record<string, unknown>) {
    await this.producer.send({
      topic,
      messages: [{ key, value: JSON.stringify(value) }],
    });
    this.logger.debug(`Event published to ${topic}: ${key}`);
  }
}