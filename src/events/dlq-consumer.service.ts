import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer } from 'kafkajs';

@Injectable()
export class DlqConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DlqConsumer.name);
  private consumer: Consumer;

  constructor(private configService: ConfigService) {
    const brokers = this.configService.get<string>('kafka.brokers', 'localhost:9092').split(',');
    const kafka = new Kafka({ brokers });
    this.consumer = kafka.consumer({ groupId: 'seatlock-dlq-consumer' });
  }

  async onModuleInit() {
    await this.consumer.connect();

    const dlqTopics = [
      'reservation.created.dlq',
      'sale.confirmed.dlq',
      'reservation.expired.dlq',
      'seat.released.dlq',
    ];
    const groupId = this.configService.get<string>('kafka.groupId', 'seatlock-consumer');

    for (const topic of dlqTopics) {
      await this.consumer.subscribe({ topic, fromBeginning: false });
    }

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        this.logger.error({
          message: 'DLQ message received',
          topic,
          partition,
          offset: message.offset,
          key: message.key?.toString(),
          value: message.value?.toString(),
        });
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}