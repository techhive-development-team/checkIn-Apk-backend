import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCompanyDto {

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

}
