import { Injectable } from '@nestjs/common';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { PrismaService } from 'src/prisma.service';
import { CustomNotFoundException } from 'src/common/exceptions/custom.exceptions';
import { saveBase64Image } from 'src/common/store/image.upload';

@Injectable()
export class LeaveRequestService {
  constructor(private prisma: PrismaService) { }

  async create(employeeId: string, createLeaveRequestDto: CreateLeaveRequestDto) {
    let imagePath: string | undefined;
    if (createLeaveRequestDto.file) {
      imagePath = saveBase64Image(createLeaveRequestDto.file)
      createLeaveRequestDto.file = imagePath
    }
    return await this.prisma.leaveRequestData.create({
      data: {
        employeeId: employeeId,
        leaveType: createLeaveRequestDto.leaveType,
        startDate: createLeaveRequestDto.startDate,
        endDate: createLeaveRequestDto.endDate,
        reason: createLeaveRequestDto.reason,
        file: imagePath
      }
    });
  }

  private buildWhereClause(filters: {
    employeeId?: string;
    companyId?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    const { employeeId, companyId, fromDate, toDate } = filters;
    return {
      ...(employeeId && { employeeId }),
      ...(companyId && { employee: { companyId } }),
      ...((fromDate || toDate) && {
        createdAt: {
          ...(fromDate && { gte: new Date(fromDate) }),
          ...(toDate && { lte: new Date(toDate) }),
        },
      }),
    };
  }

  private async paginatedQuery(where: object, limit: number, offset: number) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.leaveRequestData.findMany({
        where,
        take: limit,
        skip: offset,
        include: { employee: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.leaveRequestData.count({ where }),
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

  async findByAdmin(filters: { employeeId?: string; fromDate?: string; toDate?: string; limit?: number; offset?: number }) {
    const { limit = 10, offset = 0, ...rest } = filters;
    return this.paginatedQuery(this.buildWhereClause(rest), limit, offset);
  }

  async findByCompany(filters: { companyId: string; employeeId?: string; fromDate?: string; toDate?: string; limit?: number; offset?: number }) {
    const { limit = 10, offset = 0, ...rest } = filters;
    return this.paginatedQuery(this.buildWhereClause(rest), limit, offset);
  }

  async findByEmployee(filters: { employeeId: string; fromDate?: string; toDate?: string; limit?: number; offset?: number }) {
    const { limit = 10, offset = 0, ...rest } = filters;
    return this.paginatedQuery(this.buildWhereClause(rest), limit, offset);
  }

  async findOne(id: string) {
    const leave = await this.prisma.leaveRequestData.findUnique({
      where: { id },
      include: {
        employee: true
      }
    })
    if (!leave) {
      throw new CustomNotFoundException(`Leave with this ID ${id} not found`)
    }
    return leave;
  }

  async update(id: string, updateLeaveRequestDto: UpdateLeaveRequestDto) {
    if (updateLeaveRequestDto.file) {
      updateLeaveRequestDto.file = saveBase64Image(updateLeaveRequestDto.file)
    }
    return await this.prisma.leaveRequestData.update({
      where: { id },
      data: updateLeaveRequestDto
    })
  }

  async remove(id: string) {
    return this.prisma.leaveRequestData.delete({ where: { id } });
  }
}
