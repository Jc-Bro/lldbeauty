import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, Prisma, RecurrenceType } from '@prisma/client';
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
      include: { appointments: true },
    });
  }

  createSlot(input: CreateAvailabilitySlotInput) {
    const startAt = new Date(input.startAt);
    const endAt = new Date(input.endAt);

    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      throw new BadRequestException('Invalid slot date or time');
    }

    if (endAt.getTime() <= startAt.getTime()) {
      throw new BadRequestException('Slot end time must be after start time');
    }

    const data: Prisma.AvailabilitySlotCreateInput = {
      serviceName: input.serviceName?.trim() || undefined,
      startAt,
      endAt,
      recurrenceType: input.recurrenceType ?? RecurrenceType.NONE,
    };

    return this.prisma.availabilitySlot.create({ data });
  }

  async deleteSlot(id: string) {
    const slot = await this.prisma.availabilitySlot.findUnique({
      where: { id },
      include: { appointments: true },
    });

    if (!slot) {
      throw new NotFoundException('Availability slot not found');
    }

    const hasActiveAppointment = slot.appointments.some(
      (appointment) => appointment.status !== AppointmentStatus.CANCELLED,
    );

    if (hasActiveAppointment) {
      throw new ConflictException('Cannot delete a slot with an active appointment');
    }

    return this.prisma.availabilitySlot.delete({ where: { id } });
  }
}
