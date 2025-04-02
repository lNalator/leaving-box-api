import { Module } from '@nestjs/common';
import { SessionsController } from './session.controller';
import { SessionService } from './session.service';
import { SessionsGateway } from './session.gateway';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  controllers: [SessionsController],
  imports: [RedisModule],
  providers: [SessionService, SessionsGateway],
  exports: [SessionService],
})
export class SessionsModule {}
