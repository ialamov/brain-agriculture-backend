import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFarmerDto {
  @ApiProperty({
    description: 'Farmer name',
    example: 'João Silva'
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    description: 'Farmer CPF (optional)',
    example: '123.456.789-00',
    required: false
  })
  @IsOptional()
  @IsString()
  cpf?: string;

  @ApiProperty({
    description: 'Farmer CNPJ (optional)',
    example: '12.345.678/0001-90',
    required: false
  })
  @IsOptional()
  @IsString()
  cnpj?: string;
}
