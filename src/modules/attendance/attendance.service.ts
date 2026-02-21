import { Injectable } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { PrismaService } from 'src/prisma.service';
import { CustomNotFoundException } from 'src/common/exceptions/custom.exceptions';
import { saveBase64Image } from 'src/common/store/image.upload';

@Injectable()
export class AttendanceService {
  constructor(private readonly prismaService: PrismaService) { }

  async create(employeeId: string, createAttendanceDto: CreateAttendanceDto) {
    const today = this.getTodayRange();
    const attendance = await this.prismaService.attendance.findFirst({
      where: { employeeId, date: today },
    });

    if (!attendance) {
      return this.checkIn(employeeId, createAttendanceDto);
    }

    if (!attendance.checkOutTime) {
      return this.checkOut(attendance.id, createAttendanceDto);
    }
  }

  async findAll(filters?: { user?: any; limit?: number; offset?: number }) {
    const { user, limit = 10, offset = 0 } = filters || {};
    console.log(user)
    const whereClause = await this.getWhereClause(user);

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.attendance.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          employee: { include: { company: true } },
        }
      }),
      this.prismaService.attendance.count({
        where: whereClause,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        limit,
        offset,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
      },
    };
  }


  async getUserTodayAttendanceStatus(employeeId: string) {
    const today = this.getTodayRange();
    const attendance = await this.prismaService.attendance.findFirst({
      where: { employeeId, date: today },
    });
    if (!attendance) {
      throw new CustomNotFoundException("Not Found");
    }
    return attendance;
  }

  findOne(attendanceId: string, user: any) {
    const whereClause = this.getWhereClause(user, attendanceId);
    const attendance = this.prismaService.attendance.findUnique({
      where: whereClause,
      include: { employee: { include: { company: true } } },
    });
    if (!attendance) {
      throw new CustomNotFoundException(`Attendance record ID ${attendanceId} not found.`);
    }
    return attendance;
  }

  async update(attendanceId: string, updateAttendanceDto: UpdateAttendanceDto) {
    if (updateAttendanceDto.checkInPhoto && updateAttendanceDto.checkInPhoto !== undefined) {
      updateAttendanceDto.checkInPhoto = saveBase64Image(updateAttendanceDto.checkInPhoto);
    }
    if (updateAttendanceDto.checkOutPhoto && updateAttendanceDto.checkOutPhoto !== undefined) {
      updateAttendanceDto.checkOutPhoto = saveBase64Image(updateAttendanceDto.checkOutPhoto);
    }
    // return this.prismaService.attendance.update({
    //   where: { id: attendanceId },
    //   data: updateAttendanceDto,
    // });
  }

  async remove(attendanceId: string, user: any) {
    await this.findOne(attendanceId, user);
    return this.prismaService.attendance.update({
      where: {
        id: attendanceId
      },
      data: {
        deletedAt: new Date()
      }
    });
  }

  private getTodayRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { gte: start, lte: end };
  }

  private checkIn(employeeId: string, dto: CreateAttendanceDto) {
    if (dto.checkInPhoto && dto.checkInPhoto !== undefined) {
      dto.checkInPhoto = saveBase64Image(dto.checkInPhoto);
    }
    return this.prismaService.attendance.create({
      data: {
        employeeId,
        date: new Date(),
        checkInTime: new Date(),
        checkInPhoto: dto.checkInPhoto,
        checkInLocation: dto.checkInLocation,
      },
    });
  }

  private checkOut(attendanceId: string, dto: CreateAttendanceDto) {
    if (dto.checkOutPhoto && dto.checkOutPhoto !== undefined) {
      dto.checkOutPhoto = saveBase64Image(dto.checkOutPhoto);
    }
    return this.prismaService.attendance.update({
      where: { id: attendanceId },
      data: {
        checkOutTime: new Date(),
        checkOutPhoto: dto.checkOutPhoto,
        checkOutLocation: dto.checkOutLocation,
      },
    });
  }

  private getWhereClause(user: any, attendanceId?: string) {
    const baseWhere: any = attendanceId ? { id: attendanceId } : {};

    switch (user.systemRole) {
      case 'USER':
        return { ...baseWhere, employeeId: user.employeeId };
      case 'COMPANY_OWNER':
        return { ...baseWhere, employee: { companyId: user.companyId } };
      case 'SUPER_ADMIN':
        return baseWhere;
      default:
        return baseWhere;
    }
  }
}
