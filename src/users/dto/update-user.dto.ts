import { IsString, IsNotEmpty, MinLength, MaxLength } from "class-validator";

export class UpdateUserDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(32)
    password: string;
}
