import { PartialType } from '@nestjs/mapped-types';
import { CreateFarmDto } from './create-farm.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateFarmDto extends PartialType(CreateFarmDto) {
  @IsOptional()
  @IsString()
  farmerId?: string;
}
