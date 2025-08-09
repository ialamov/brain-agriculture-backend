import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateCropDto {
  @ApiProperty({
    description: 'Crop name',
    example: 'Milho'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Harvest ID',
    example: 'uuid-harvest-id'
  })
  @IsNotEmpty()
  @IsString()
  harvestId: string;
}
