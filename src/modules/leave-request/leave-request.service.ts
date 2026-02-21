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

  async findByAdmin(filters: { limit?: number; offset?: number }) {
    const { limit = 10, offset = 0 } = filters;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.leaveRequestData.findMany({
        take: limit,
        skip: offset,
        include: { employee: true },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.leaveRequestData.count()
    ]);
    return {
      data,
      meta: {
        total, limit, offset,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
      }
    }
  }

  async findByCompany(filters: { companyId: string; limit?: number; offset?: number }) {
    const { companyId, limit = 10, offset = 0 } = filters;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.leaveRequestData.findMany({
        take: limit,
        skip: offset,
        include: { employee: true },
        where: {
          employee: {
            companyId: companyId
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.leaveRequestData.count({ where: { employee: { companyId } } })
    ]);
    return {
      data,
      meta: {
        total, limit, offset,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
      }
    }
  }

  async findByEmployee(filters: { employeeId: string; limit?: number; offset?: number }) {
    const { employeeId, limit = 10, offset = 0 } = filters;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.leaveRequestData.findMany({
        take: limit,
        skip: offset,
        include: { employee: true },
        where: {
          employeeId: employeeId
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.leaveRequestData.count({ where: { employeeId } })
    ]);
    return {
      data,
      meta: {
        total, limit, offset,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
      }
    }
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

  update(id: number, updateLeaveRequestDto: UpdateLeaveRequestDto) {
    return `This action updates a #${id} leaveRequest`;
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.leaveRequestData.delete({ where: { id } });
  }
}
