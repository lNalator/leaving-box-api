import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SessionsModule } from './session/session.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './session/redis/redis.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ModuleModule } from './game/modules/module.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? './environment/.env.prod' : './environment/.env.dev', 
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL as string),
    ModuleModule,
    SessionsModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
