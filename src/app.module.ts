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
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRoot(
      `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@localhost:27017/leaving_box?authSource=admin`,
    ),
    ModuleModule,
    SessionsModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
