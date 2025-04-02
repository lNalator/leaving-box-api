import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {  ApiTags } from '@nestjs/swagger';
import { ModuleService } from './module.service';
import { ModuleEntity } from './module.schema';
import { CreateModuleDto } from './dto/createModule.ressource';

@ApiTags('Modules')
@Controller('module')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post()
  async createModule(@Body() createdModuleDto: CreateModuleDto) {
    return await this.moduleService.createModule(createdModuleDto);
  }

  @Get()
  async findAll() {
    return await this.moduleService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.moduleService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() module: ModuleEntity) {
    return await this.moduleService.update(id, module);
  }

  @Delete(':id/delete')
  async delete(@Param('id') id: string) {
    return await this.moduleService.delete(id);
  }
}
