import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('should implement OnModuleInit', () => {
    expect(typeof PrismaService.prototype.onModuleInit).toBe('function');
  });

  it('should implement OnModuleDestroy', () => {
    expect(typeof PrismaService.prototype.onModuleDestroy).toBe('function');
  });
});