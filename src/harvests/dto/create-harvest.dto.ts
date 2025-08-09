import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateHarvestDto {
  @ApiProperty({
    description: 'Harvest name',
    example: 'Safra de Milho 2024'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Harvest year',
    example: 2024
  })
  @IsNumber()
  @IsNotEmpty()
  year: number;

  @ApiProperty({
    description: 'Farm ID',
    example: 'uuid-farm-id'
  })
  @IsNotEmpty()
  @IsString()
  farmId: string;
}
