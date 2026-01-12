import {
    IsString,
    IsEmail,
    IsOptional,
    IsNotEmpty,
    MaxLength,
} from 'class-validator';

export class CreateEmployeeDto {

    @IsNotEmpty()
    companyId: string;

    @IsOptional()
    @IsString()
    profilePic?: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    lastName: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    position?: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsOptional()
    phone?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    address?: string;
}
