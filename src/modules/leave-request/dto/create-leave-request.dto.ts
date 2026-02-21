import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { LeaveType } from "prisma/generated/enums";

export class CreateLeaveRequestDto {

    @IsString()
    @IsEnum(LeaveType)
    public leaveType: LeaveType;

    @Type(() => Date)
    @IsDate()
    public startDate: Date;

    @Type(() => Date)
    @IsDate()
    public endDate: Date;

    @IsNotEmpty()
    @IsString()
    public reason: string;

    @IsOptional()
    @IsString()
    file?: string;
}
