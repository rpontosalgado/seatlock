import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL || 'postgresql://seatlock:seatlock@localhost:5432/seatlock?schema=public',
}));