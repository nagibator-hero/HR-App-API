import { Injectable } from '@nestjs/common';
import { ApplicantStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { UpdateApplicantDto } from './dto/update-applicant.dto';

@Injectable()
export class ApplicantService {
  constructor(private readonly prismaService: PrismaService) {}
  
  async create(createApplicantDto: CreateApplicantDto) {
    const createdObject = await this.prismaService.applicant.create({ data: createApplicantDto });
    const appliedVacancyObject = await this.prismaService.vacancy.findUnique({ where: { vacancyId: createApplicantDto.appliedVacancyId } });
    appliedVacancyObject.responderIds.push(createdObject.applicantId);
    await this.prismaService.vacancy.update({ where: { vacancyId: createApplicantDto.appliedVacancyId }, data: { responderIds: appliedVacancyObject.responderIds } });
    return {message: 'Applicant created', createdApplicant: createdObject};
  }

  async findAll(vacancyId: string) {
    const applicants = await this.prismaService.applicant.findMany({ where: { appliedVacancyId: vacancyId } });
    return applicants;
  }

  async findOne(applicantId: string) {
    const applicant = await this.prismaService.applicant.findUnique({ where: { applicantId } });
    return applicant;
  }

  async update(applicantId: string, updateApplicantDto: UpdateApplicantDto) {
    const updatedObject = await this.prismaService.applicant.update({ where: { applicantId }, data: updateApplicantDto });
    return {message: 'Applicant updated', updatedApplicant: updatedObject};
  }

  async remove(applicantId: string) {
    const deletingApplicantObject = await this.prismaService.applicant.findUnique({ where: { applicantId: applicantId } });
    const parentVacancyObject = await this.prismaService.vacancy.findUnique({ where: { vacancyId: deletingApplicantObject.appliedVacancyId } });
    const applicantIndex = parentVacancyObject.responderIds.indexOf(applicantId);
    delete parentVacancyObject.responderIds[applicantIndex]
    await this.prismaService.vacancy.update({ where: { vacancyId: parentVacancyObject.vacancyId }, data: { responderIds: parentVacancyObject.responderIds } });
    const deletedObject = await this.prismaService.applicant.delete({ where: { applicantId } });
    return {message: 'Applicant deleted', deletedApplicant: deletedObject};
  }

  async changeStatus(applicantId: string, status: string) {
      const enumApplicantStatus = this.getEnumStatusFromString(status)
      const updatedObject = await this.prismaService.applicant.update({ where: { applicantId: applicantId }, data: { status: enumApplicantStatus } })
      return {message: "Applicant status updated", updated_object: updatedObject}
  }

  private getEnumStatusFromString(stringApplicantStatus: string): ApplicantStatus {
      let enumApplicantStatus: ApplicantStatus;
      return enumApplicantStatus
  }
}
