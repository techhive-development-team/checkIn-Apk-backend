import { Controller, Get, Post, Body, Param, Delete, Req, UseGuards, Res, Patch } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse } from 'src/common/exceptions/api-response';
import * as ExcelJS from 'exceljs';
import type { Response } from 'express';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createAttendanceDto: CreateAttendanceDto, @Req() req) {
    if (req.user.role !== 'USER') {
      return ApiResponse.unauthorized('Only users can create attendance records');
    }
    const attendance = await this.attendanceService.create(req.user.employeeId, createAttendanceDto);
    return ApiResponse.success(attendance, 'Attendance created successfully', 201);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/status')
  async getStatus(@Req() req) {
    const attendance = await this.attendanceService.getUserTodayAttendanceStatus(req.user.employeeId);
    return ApiResponse.success(attendance, 'Attendance status retrieved successfully.')
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    const attendances = await this.attendanceService.findAll(req.user);
    return ApiResponse.success(attendances, 'Attendance records retrieved successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Get('/export')
  async export(@Req() req, @Res() res: Response): Promise<void> {
    const attendances = (await this.attendanceService.findAll(req.user)) ?? [];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Check In Time', key: 'checkInTime', width: 20 },
      { header: 'Check In Location', key: 'checkInLocation', width: 30 },
      { header: 'Check Out Time', key: 'checkOutTime', width: 20 },
      { header: 'Check Out Location', key: 'checkOutLocation', width: 30 },
    ];

    attendances.forEach((att) => {
      worksheet.addRow({
        date: att.date,
        name: att.employee.firstName + ' ' + att.employee.lastName,
        checkInTime: att.checkInTime,
        checkInLocation: att.checkInLocation,
        checkOutTime: att.checkOutTime,
        checkOutLocation: att.checkOutLocation,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="attendance.xlsx"',
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.send(buffer);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':attendanceId')
  async update(
    @Param('attendanceId') attendanceId: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
    @Req() req
  ) {
    if (req.user.role !== 'ADMIN') {
      return ApiResponse.unauthorized('Only admins can update attendance records');
    }
    const attendance = await this.attendanceService.update(attendanceId, updateAttendanceDto);
    return ApiResponse.success(attendance, 'Attendance updated successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Get(':attendanceId')
  async findOne(
    @Param('attendanceId') attendanceId: string,
    @Req() req) {
    const attendance = await this.attendanceService.findOne(attendanceId, req.user);
    return ApiResponse.success(attendance, 'Attendance retrieved successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':attendanceId')
  async remove(@Param('attendanceId') attendanceId: string, @Req() req) {
    const attendance = await this.attendanceService.remove(attendanceId, req.user);
    return ApiResponse.success(attendance, 'Attendance deleted successfully');
  }

}
