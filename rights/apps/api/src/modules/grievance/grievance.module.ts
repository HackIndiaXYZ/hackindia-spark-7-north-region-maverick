import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { GrievanceController } from './grievance.controller';
import { GrievanceService } from './grievance.service';
import { AiService } from './ai.service';
import { ChainService } from './chain.service';
import { PrismaService } from '../../prisma.service';
import { CommunityModule } from '../community/community.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'notice' }),
    CommunityModule,
  ],
  controllers: [GrievanceController],
  providers: [GrievanceService, AiService, ChainService, PrismaService],
  exports: [GrievanceService, AiService, ChainService],
})
export class GrievanceModule {}
