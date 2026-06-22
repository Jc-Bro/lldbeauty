import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { AppointmentStatus, Prisma, RecurrenceType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface CreateAppointmentInput {
  clientName: string;
  clientFirstName: string;
  clientPhone: string;
  clientEmail: string;
  serviceName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  slotId?: string;
}

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  listAppointments() {
    return this.prisma.appointment.findMany({
      orderBy: [{ appointmentDate: 'asc' }, { startTime: 'asc' }],
      include: { slot: true },
    });
  }

  async createAppointment(input: CreateAppointmentInput) {
    const clientName = this.requireValue(input.clientName, 'clientName');
    const clientFirstName = this.requireValue(input.clientFirstName, 'clientFirstName');
    const clientPhone = this.requireValue(input.clientPhone, 'clientPhone');
    const clientEmail = this.requireValue(input.clientEmail, 'clientEmail');

    if (input.slotId) {
      const slot = await this.prisma.availabilitySlot.findUnique({
        where: { id: input.slotId },
        include: { appointments: true },
      });

      if (!slot) {
        throw new BadRequestException('Selected slot does not exist');
      }

      const appointmentDate = this.resolveAppointmentDate(slot, input.appointmentDate);
      const startTime = this.formatTime(appointmentDate);
      const endTime = this.formatTime(
        new Date(appointmentDate.getTime() + (slot.endAt.getTime() - slot.startAt.getTime())),
      );

      const slotAlreadyBooked = slot.appointments.some(
        (appointment) =>
          appointment.status !== AppointmentStatus.CANCELLED &&
          appointment.appointmentDate.getTime() === appointmentDate.getTime(),
      );

      if (slotAlreadyBooked) {
        throw new ConflictException('Selected slot has already been booked');
      }

      const data: Prisma.AppointmentCreateInput = {
        clientName,
        clientFirstName,
        clientPhone,
        clientEmail,
        serviceName: slot.serviceName ?? this.requireValue(input.serviceName, 'serviceName'),
        appointmentDate,
        startTime,
        endTime,
        status: AppointmentStatus.PENDING,
        slot: { connect: { id: slot.id } },
      };

      return this.prisma.appointment.create({ data, include: { slot: true } });
    }

    const data: Prisma.AppointmentCreateInput = {
      clientName,
      clientFirstName,
      clientPhone,
      clientEmail,
      serviceName: this.requireValue(input.serviceName, 'serviceName'),
      appointmentDate: new Date(this.requireValue(input.appointmentDate, 'appointmentDate')),
      startTime: this.requireValue(input.startTime, 'startTime'),
      endTime: this.requireValue(input.endTime, 'endTime'),
      status: AppointmentStatus.PENDING,
      slot: input.slotId ? { connect: { id: input.slotId } } : undefined,
    };

    return this.prisma.appointment.create({ data, include: { slot: true } });
  }

  private requireValue(value: string | undefined, fieldName: string): string {
    if (!value?.trim()) {
      throw new BadRequestException(`${fieldName} is required`);
    }

    return value.trim();
  }

  private resolveAppointmentDate(
    slot: {
      startAt: Date;
      endAt: Date;
      recurrenceType: RecurrenceType;
    },
    appointmentDateValue: string,
  ): Date {
    if (slot.recurrenceType === RecurrenceType.NONE) {
      return slot.startAt;
    }

    const appointmentDate = new Date(this.requireValue(appointmentDateValue, 'appointmentDate'));

    if (Number.isNaN(appointmentDate.getTime())) {
      throw new BadRequestException('appointmentDate is invalid');
    }

    const slotDurationMs = slot.endAt.getTime() - slot.startAt.getTime();

    if (slotDurationMs <= 0) {
      throw new BadRequestException('Selected slot is invalid');
    }

    if (!this.matchesRecurrence(slot.startAt, appointmentDate, slot.recurrenceType)) {
      throw new BadRequestException('Selected recurring occurrence is invalid');
    }

    return appointmentDate;
  }

  private matchesRecurrence(
    sourceStartAt: Date,
    occurrenceStartAt: Date,
    recurrenceType: RecurrenceType,
  ): boolean {
    const diffMs = occurrenceStartAt.getTime() - sourceStartAt.getTime();

    if (diffMs < 0) {
      return false;
    }

    const dayMs = 24 * 60 * 60 * 1000;
    const intervalMs = recurrenceType === RecurrenceType.DAILY ? dayMs : 7 * dayMs;

    return diffMs % intervalMs === 0;
  }

  private formatTime(value: Date): string {
    return value.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Europe/Paris',
    });
  }
}
