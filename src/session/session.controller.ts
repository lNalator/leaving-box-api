import {
  Body,
  Controller,
  NotFoundException,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
// import JoinSessionDTO from 'src/ressource/joinSession.ressource';
// import CreateSessionDTO from 'src/ressource/createSession.ressource';
// import ClearSessionDTO from 'src/ressource/clearSession.ressource';

@ApiTags('game')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionService: SessionService) {}

  // // Endpoint pour créer une session
  // @Post()
  // createSession(@Body() createSessionDto: CreateSessionDTO) {
  //   return this.sessionService.createSession(createSessionDto);
  // }

  // // Vous pouvez ajouter un endpoint pour rejoindre une session
  // @Post('join')
  // joinSession(@Body() joinSessionDto: JoinSessionDTO) {
  //   const session = this.sessionService.joinSession(joinSessionDto);
  //   if (session) {
  //     return session;
  //   } else {
  //     return { error: 'Session not found or operator already joined' };
  //   }
  // }

  // @Post('clear')
  // clearSession(@Body() clearSessionDTO: ClearSessionDTO) {
  //   const result = this.sessionService.clearSession(clearSessionDTO);
  //   if (!result) {
  //     throw new NotFoundException('Session not found');
  //   }
  //   return { message: 'Session cleared' };
  // }
}
