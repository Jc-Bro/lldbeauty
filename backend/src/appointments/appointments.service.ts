import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { AppointmentStatus, Prisma } from '@prisma/client';
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

      const slotAlreadyBooked = slot.appointments.some(
        (appointment) => appointment.status !== AppointmentStatus.CANCELLED,
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
        appointmentDate: slot.startAt,
        startTime: this.formatTime(slot.startAt),
        endTime: this.formatTime(slot.endAt),
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

  private formatTime(value: Date): string {
    return value.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Europe/Paris',
    });
  }
}
