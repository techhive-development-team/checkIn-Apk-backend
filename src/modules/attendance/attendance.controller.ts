import { Controller, Get, Post, Body, Param, Delete, Req, UseGuards, Res, Patch, Query, ParseIntPipe } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiResponse } from 'src/common/exceptions/api-response';
import * as ExcelJS from 'exceljs';
import type { Response } from 'express';
import { CustomUnauthorizedException } from 'src/common/exceptions/custom.exceptions';

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
  async findAll(
    @Req() req,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('employeeId') employeeId?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('offset', new ParseIntPipe({ optional: true })) offset: number = 0,
  ) {
    const attendances = await this.attendanceService.findAll({
      user: req.user,
      fromDate,
      toDate,
      employeeId,
      limit,
      offset,
    });

    return ApiResponse.success(
      attendances,
      'Attendance records retrieved successfully'
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/export')
  async export(@Req() req, @Res() res: Response): Promise<void> {
    const attendances = (await this.attendanceService.findAll({ user: req.user })) ?? [];

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

    attendances.data.forEach((att) => {
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
    const attendance = await this.attendanceService.findOne(attendanceId, req.user);
    this.authorizeUpdateAndDelete(attendance, req.user)
    const updatedAttendance = await this.attendanceService.update(attendanceId, updateAttendanceDto);
    return ApiResponse.success(updatedAttendance, 'Attendance updated successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Get(':attendanceId')
  async findOne(
    @Param('attendanceId') attendanceId: string,
    @Req() req) {
    const attendance = await this.attendanceService.findOne(attendanceId, req.user);
    this.authorizeUpdateAndDelete(attendance, req.user)
    return ApiResponse.success(attendance, 'Attendance retrieved successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':attendanceId')
  async remove(@Param('attendanceId') attendanceId: string, @Req() req) {
    const attendance = await this.attendanceService.findOne(attendanceId, req.user);
    this.authorizeUpdateAndDelete(attendance, req.user)
    const attendanceToDelete = await this.attendanceService.remove(attendanceId, req.user);
    return ApiResponse.success(attendanceToDelete, 'Attendance deleted successfully');
  }

  private authorizeUpdateAndDelete(attendance, user) {
    if (user.role === 'CLIENT' && attendance.employee.companyId !== user.companyId) {
      throw new CustomUnauthorizedException('You are not allowed to access this attendance request');
    }
    if (user.role === 'USER' && attendance.employeeId !== user.employeeId) {
      throw new CustomUnauthorizedException('You are not allowed to access this attendance request');
    }
  }

}
