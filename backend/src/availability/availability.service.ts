import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, Prisma, RecurrenceType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface CreateAvailabilitySlotInput {
  serviceName?: string;
  startAt: string;
  endAt: string;
  recurrenceType?: RecurrenceType;
}

type AvailabilitySlotWithAppointments = Prisma.AvailabilitySlotGetPayload<{
  include: { appointments: true };
}>;

@Injectable()
export class AvailabilityService {
  private readonly recurrenceWindowDays = 90;

  constructor(private readonly prisma: PrismaService) {}

  async listSlots() {
    const slots = await this.prisma.availabilitySlot.findMany({
      orderBy: { startAt: 'asc' },
      include: { appointments: true },
    });

    const now = new Date();
    const horizon = new Date(now);
    horizon.setDate(horizon.getDate() + this.recurrenceWindowDays);

    return slots
      .flatMap((slot) => this.expandSlot(slot, now, horizon))
      .sort((left, right) => left.startAt.getTime() - right.startAt.getTime());
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

  private expandSlot(
    slot: AvailabilitySlotWithAppointments,
    now: Date,
    horizon: Date,
  ): AvailabilitySlotWithAppointments[] {
    if (slot.recurrenceType === RecurrenceType.NONE) {
      return slot.endAt.getTime() >= now.getTime() ? [slot] : [];
    }

    const occurrences: AvailabilitySlotWithAppointments[] = [];
    const durationMs = slot.endAt.getTime() - slot.startAt.getTime();
    const stepDays = slot.recurrenceType === RecurrenceType.DAILY ? 1 : 7;
    const firstOccurrenceStart = this.firstOccurrenceStart(slot, now, stepDays);

    for (
      const occurrenceStart = new Date(firstOccurrenceStart);
      occurrenceStart.getTime() <= horizon.getTime();
      occurrenceStart.setUTCDate(occurrenceStart.getUTCDate() + stepDays)
    ) {
      const occurrenceEnd = new Date(occurrenceStart.getTime() + durationMs);
      occurrences.push(this.buildOccurrence(slot, occurrenceStart, occurrenceEnd));
    }

    return occurrences;
  }

  private firstOccurrenceStart(
    slot: AvailabilitySlotWithAppointments,
    now: Date,
    stepDays: number,
  ): Date {
    const sourceStart = slot.startAt.getTime();
    const intervalMs = stepDays * 24 * 60 * 60 * 1000;

    if (sourceStart >= now.getTime()) {
      return new Date(slot.startAt);
    }

    const elapsedMs = now.getTime() - sourceStart;
    const skippedIntervals = Math.floor(elapsedMs / intervalMs);
    const candidate = new Date(sourceStart + skippedIntervals * intervalMs);

    return candidate.getTime() >= now.getTime()
      ? candidate
      : new Date(candidate.getTime() + intervalMs);
  }

  private buildOccurrence(
    slot: AvailabilitySlotWithAppointments,
    occurrenceStart: Date,
    occurrenceEnd: Date,
  ): AvailabilitySlotWithAppointments {
    const occurrenceStartAt = new Date(occurrenceStart);
    const occurrenceEndAt = new Date(occurrenceEnd);

    return {
      ...slot,
      id: `${slot.id}:${occurrenceStartAt.toISOString()}`,
      sourceSlotId: slot.id,
      startAt: occurrenceStartAt,
      endAt: occurrenceEndAt,
      appointments: slot.appointments.filter(
        (appointment) => appointment.appointmentDate.getTime() === occurrenceStartAt.getTime(),
      ),
    } as AvailabilitySlotWithAppointments;
  }
}
