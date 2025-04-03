import { Controller, Get, Param } from '@nestjs/common';
import { SessionService } from './session.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('')
  async getAllSessions() {
    return await this.sessionService.getAllSessions();
  }

  @Get(':sessionCode')
  async getSession(@Param('sessionCode') sessionCode: string) {
    const session = await this.sessionService.getSession(sessionCode);
    if (!session) {
      return { success: false, message: 'Session not found' };
    }
    return { success: true, session };
  }
}
