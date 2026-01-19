import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PrismaService } from 'src/prisma.service';
import { CompanyService } from '../company/company.service';
import { UserService } from '../user/user.service';
import { saveBase64Image } from 'src/common/store/image.upload';
import { randomBytes } from 'crypto';
import * as argon2 from 'argon2';
import { Role } from 'prisma/generated/enums';
import { EmployeeFilterDto } from './dto/filter-employee.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companyService: CompanyService,
    private readonly userService: UserService,
    private readonly mailService: MailService
  ) { }

  async findAll(filterEmployeeDto: EmployeeFilterDto) {
    const { limit = 10, offset = 0 } = filterEmployeeDto;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        take: limit,
        skip: offset,
        include: { company: true },
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.employee.count({ where: { deletedAt: null } }),
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

  async createByCompanyId(companyId: string, createEmployeeDto: CreateEmployeeDto) {
    const company = await this.companyService.findOne(companyId);
    const existed = await this.findByEmail(createEmployeeDto.email);
    const existedUser = await this.userService.findByEmail(createEmployeeDto.email);
    if (existed || existedUser) {
      throw new ConflictException(
        `Company with email ${createEmployeeDto.email} already exists`,
      );
    }
    let imagePath: string | undefined;
    if (createEmployeeDto.profilePic) {
      imagePath = saveBase64Image(createEmployeeDto.profilePic)
      createEmployeeDto.profilePic = imagePath
    }
    const rawPassword = randomBytes(6)
      .toString('base64')
      .replace(/[+/=]/g, 'A')
      .slice(0, 8);
    const password = await argon2.hash(rawPassword);

    await this.mailService.sendAccountCreateMail(
      createEmployeeDto.email,
      `${createEmployeeDto.firstName} ${createEmployeeDto.lastName}`,
      createEmployeeDto.email,
      rawPassword,
      company.name
    );
    
    return this.prisma.$transaction(async (tx) => {
      const employee = await tx.employee.create({
        data: {
          companyId: companyId,
          profilePic: imagePath,
          firstName: createEmployeeDto.firstName,
          lastName: createEmployeeDto.lastName,
          position: createEmployeeDto.position,
          email: createEmployeeDto.email,
          phone: createEmployeeDto.phone,
          address: createEmployeeDto.address,
        }
      })
      await tx.user.create({
        data: {
          email: createEmployeeDto.email,
          employeeId: employee.employeeId,
          role: Role.USER,
          password: password,
        }
      })
      return employee;
    })
  }

  findByEmail(email: string) {
    return this.prisma.employee.findUnique({
      where: { email },
    });
  }

  async findByCompanyId(filters: { companyId: string; limit?: number; offset?: number }) {
    const { companyId, limit = 10, offset = 0 } = filters;
    this.companyService.findOne(companyId);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        take: limit,
        skip: offset,
        include: { company: true },
        where: { deletedAt: null, companyId: companyId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.employee.count({ where: { deletedAt: null, companyId: companyId } }),
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

  async findOneByCompanyIdAndEmployeeId(companyId: string, employeeId: string) {
    this.companyService.findOne(companyId);
    const employee = await this.prisma.employee.findUnique({
      where: {
        employeeId,
        companyId
      }
    })
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }
    return employee;
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: {
        employeeId: id,
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  async update(companyId: string, employeeId: string, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.findOneByCompanyIdAndEmployeeId(companyId, employeeId);
    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
      const existed = await this.findByEmail(updateEmployeeDto.email);
      const existedInUser = await this.userService.findByEmail(updateEmployeeDto.email);
      if (existed || existedInUser) {
        throw new ConflictException(
          `Employee with email ${updateEmployeeDto.email} already exists`,
        );
      }
    }
    let imagePath: string | undefined;
    if (updateEmployeeDto.profilePic) {
      imagePath = saveBase64Image(updateEmployeeDto.profilePic)
      updateEmployeeDto.profilePic = imagePath;
    }
    return this.prisma.$transaction(async (tx) => {
      const employee = await tx.employee.update({
        where: {
          employeeId: employeeId,
        },
        data: updateEmployeeDto,
      });
      if (updateEmployeeDto.email) {
        await tx.user.updateMany({
          where: { employeeId: employeeId },
          data: { email: updateEmployeeDto.email }
        })
      }
    });
  }

  async remove(companyId: string, employeeId: string) {
    await this.findOneByCompanyIdAndEmployeeId(companyId, employeeId)
    await this.userService.removeByEmployeeId(employeeId);
    return this.prisma.employee.delete({
      where: {
        employeeId: employeeId,
      },
    });
  }
}
