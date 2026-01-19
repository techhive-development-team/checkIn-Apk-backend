import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAttendanceDto {

    @IsNotEmpty()
    checkInTime: Date;

    @IsNotEmpty()
    date: Date;

    @IsOptional()
    @IsString()
    checkInPhoto?: string;

    @IsOptional()
    @IsString()
    checkInLocation?: string;

    @IsOptional()
    checkOutTime?: Date;

    @IsOptional()
    @IsString()
    checkOutPhoto?: string;

    @IsOptional()
    @IsString()
    checkOutLocation?: string;

}
