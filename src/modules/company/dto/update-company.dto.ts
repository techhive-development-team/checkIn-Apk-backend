import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyDto } from './create-company.dto';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {

    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    logo: string;

    @IsOptional()
    @IsString()
    companyType: string;

    @IsOptional()
    @IsString()
    address: string;

    @IsOptional()
    @IsString()
    phone: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsOptional()
    @IsString()
    totalEmployee: string;

    @IsString()
    @IsOptional()
    subScribeStatus?: string;

    @IsString()
    @IsOptional()
    status?: string;
}
