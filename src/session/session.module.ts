import { Module } from '@nestjs/common';
import { SessionsController } from './session.controller';
import { SessionService } from './session.service';
import { SessionsGateway } from './session.gateway';
import { RedisModule } from 'src/session/redis/redis.module';
import { ModuleModule } from 'src/game/modules/module.module';

@Module({
  controllers: [SessionsController],
  imports: [RedisModule, ModuleModule],
  providers: [SessionService, SessionsGateway],
  exports: [SessionService],
})
export class SessionsModule {}
