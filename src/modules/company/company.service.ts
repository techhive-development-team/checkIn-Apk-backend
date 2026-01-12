import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) { }

  create(createCompanyDto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: createCompanyDto
    })
  }

  findAll() {
    return this.prisma.company.findMany();
  }

  findOne(id: string) {
    const company = this.prisma.company.findUnique({
      where: {
        companyId: id
      }
    });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    await this.findOne(id);
    return this.prisma.company.update({
      where: {
        companyId: id,
      },
      data: updateCompanyDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.company.delete({
      where: {
        companyId: id,
      }
    })
  }
}
