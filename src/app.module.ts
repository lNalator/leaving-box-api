import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SessionsModule } from './session/session.module';

@Module({
  imports: [SessionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
