import { IsString, IsNumber, IsOptional, Min, Max, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFarmDto {
  @ApiProperty({
    description: 'Farm name',
    example: 'Fazenda São João'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Farm city',
    example: 'São Paulo'
  })
  @IsString()
  city: string;

  @ApiProperty({
    description: 'Farm state',
    example: 'SP'
  })
  @IsString()
  state: string;

  @ApiProperty({
    description: 'Total farm area in hectares',
    example: 100.5,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  totalArea: number;

  @ApiProperty({
    description: 'Cultivation area in hectares',
    example: 80.0,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  cultivationArea: number;

  @ApiProperty({
    description: 'Vegetation area in hectares',
    example: 20.5,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  vegetationArea: number;

  @ApiProperty({
    description: 'Farmer ID',
    example: 'uuid-farmer-id'
  })
  @IsNotEmpty()
  @IsString()
  farmerId?: string;
}
