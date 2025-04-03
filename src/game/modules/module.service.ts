import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ModuleEntity } from './module.schema';
import { Model } from 'mongoose';
import { CreateModuleDto } from './dto/createModule.ressource';

@Injectable()
export class ModuleService {
  constructor(
    @InjectModel(ModuleEntity.name)
    private readonly ModuleModel: Model<ModuleEntity>,
  ) {}

  async createModule(createdModuleDto: CreateModuleDto): Promise<ModuleEntity> {
    const createdModule = new this.ModuleModel(createdModuleDto);
    return createdModule.save();
  }

  findAll(): Promise<ModuleEntity[]> {
    return this.ModuleModel.find().exec();
  }

  findOne(id: string): Promise<ModuleEntity | null> {
    return this.ModuleModel.findById(id).exec();
  }

  findSome(quantity: number): Promise<ModuleEntity[]> {
    return this.ModuleModel.aggregate().sample(quantity).exec();    
  }

  update(id: string, module: ModuleEntity): Promise<ModuleEntity | null> {
    return this.ModuleModel.findByIdAndUpdate(id, module, { new: true }).exec();
  }

  delete(id: string): Promise<ModuleEntity | null> {
    return this.ModuleModel.findByIdAndDelete(id).exec();
  }
}
