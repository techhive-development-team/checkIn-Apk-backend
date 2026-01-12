import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createEmployeeDto: CreateEmployeeDto) {
    return this.prisma.employee.create({
      data: createEmployeeDto,
    });
  }

  async findAll() {
    return this.prisma.employee.findMany();
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

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    await this.findOne(id);
    return this.prisma.employee.update({
      where: {
        employeeId: id,
      },
      data: updateEmployeeDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.employee.delete({
      where: {
        employeeId: id,
      },
    });
  }
}
