export class CreateAttendanceDto {
    checkInTime ?: Date;
    checkInLocation ?: string;
    checkInPhoto : string;
    checkOutTime ?: Date;
    checkOutLocation ?: string;
    checkOutPhoto ?: string;
}
