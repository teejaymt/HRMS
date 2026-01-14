import { Module } from '@nestjs/common';
import { TicketRequestController } from './ticket-request.controller';
import { TicketRequestService } from './ticket-request.service';
import { PrismaModule } from '../Prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TicketRequestController],
  providers: [TicketRequestService],
  exports: [TicketRequestService],
})
export class TicketRequestModule {}
