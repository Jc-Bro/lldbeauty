import { Injectable } from '@nestjs/common';
import { Prisma, RecurrenceType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface CreateAvailabilitySlotInput {
  serviceName?: string;
  startAt: string;
  endAt: string;
  recurrenceType?: RecurrenceType;
}

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  listSlots() {
    return this.prisma.availabilitySlot.findMany({
      orderBy: { startAt: 'asc' },
      include: { appointments: true },
    });
  }

  listRecentSlots() {
    return this.prisma.availabilitySlot.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  createSlot(input: CreateAvailabilitySlotInput) {
    const data: Prisma.AvailabilitySlotCreateInput = {
      serviceName: input.serviceName,
      startAt: new Date(input.startAt),
      endAt: new Date(input.endAt),
      recurrenceType: input.recurrenceType ?? RecurrenceType.NONE,
    };

    return this.prisma.availabilitySlot.create({ data });
  }

  deleteSlot(id: string) {
    return this.prisma.availabilitySlot.delete({ where: { id } });
  }
}
