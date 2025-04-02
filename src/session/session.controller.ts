import { Controller, Get, Param } from '@nestjs/common';
import { SessionService } from './session.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('/:key')
  async getAllSessions(@Param('key') key: string) {
    console.log('key', key);
    return await this.sessionService.getAllSessions(key);
  }
}
