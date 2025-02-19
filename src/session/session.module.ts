import { Module } from '@nestjs/common';
import { SessionsController } from './session.controller';
import { SessionService } from './session.service';
import { SessionsGateway } from './session.gateway';

@Module({
  controllers: [SessionsController],
  providers: [SessionService, SessionsGateway],
  exports: [SessionService],
})
export class SessionsModule {}
