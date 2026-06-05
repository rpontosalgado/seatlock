import { Test } from '@nestjs/testing';
import { SessionsService } from '../../src/sessions/sessions.service';
import { PrismaService } from '../../src/database/prisma.service';
import { PrismaModule } from '../../src/database/prisma.module';

describe('SessionsService', () => {
  let service: SessionsService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [SessionsService],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});