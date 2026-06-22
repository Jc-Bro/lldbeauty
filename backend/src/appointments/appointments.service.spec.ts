import { BadRequestException, ConflictException } from '@nestjs/common';
import { AppointmentStatus, RecurrenceType } from '@prisma/client';
import { AppointmentsService } from './appointments.service';

describe('AppointmentsService', () => {
  const prisma = {
    appointment: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    availabilitySlot: {
      findUnique: jest.fn(),
    },
  };

  let service: AppointmentsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AppointmentsService(prisma as never);
  });

  it('creates an appointment for a recurring daily occurrence', async () => {
    prisma.availabilitySlot.findUnique.mockResolvedValue({
      id: 'slot-daily',
      serviceName: 'Soin',
      startAt: new Date('2026-06-20T08:00:00.000Z'),
      endAt: new Date('2026-06-20T09:00:00.000Z'),
      recurrenceType: RecurrenceType.DAILY,
      appointments: [],
    });
    prisma.appointment.create.mockResolvedValue({ id: 'appt-1' });

    await expect(
      service.createAppointment({
        clientName: 'Doe',
        clientFirstName: 'Jane',
        clientPhone: '0102030405',
        clientEmail: 'jane@example.com',
        serviceName: 'Soin',
        appointmentDate: '2026-06-23T08:00:00.000Z',
        startTime: '10:00',
        endTime: '11:00',
        slotId: 'slot-daily',
      }),
    ).resolves.toEqual({ id: 'appt-1' });

    expect(prisma.appointment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        appointmentDate: new Date('2026-06-23T08:00:00.000Z'),
        startTime: '10:00',
        endTime: '11:00',
      }),
      include: { slot: true },
    });
  });

  it('rejects booking a recurring occurrence that does not match the slot cadence', async () => {
    prisma.availabilitySlot.findUnique.mockResolvedValue({
      id: 'slot-weekly',
      serviceName: 'Massage',
      startAt: new Date('2026-06-15T08:00:00.000Z'),
      endAt: new Date('2026-06-15T09:30:00.000Z'),
      recurrenceType: RecurrenceType.WEEKLY,
      appointments: [],
    });

    await expect(
      service.createAppointment({
        clientName: 'Doe',
        clientFirstName: 'Jane',
        clientPhone: '0102030405',
        clientEmail: 'jane@example.com',
        serviceName: 'Massage',
        appointmentDate: '2026-06-24T08:00:00.000Z',
        startTime: '10:00',
        endTime: '11:30',
        slotId: 'slot-weekly',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects booking a recurring occurrence that is already booked', async () => {
    prisma.availabilitySlot.findUnique.mockResolvedValue({
      id: 'slot-daily',
      serviceName: 'Soin',
      startAt: new Date('2026-06-20T08:00:00.000Z'),
      endAt: new Date('2026-06-20T09:00:00.000Z'),
      recurrenceType: RecurrenceType.DAILY,
      appointments: [
        {
          id: 'appt-1',
          appointmentDate: new Date('2026-06-23T08:00:00.000Z'),
          status: AppointmentStatus.CONFIRMED,
        },
      ],
    });

    await expect(
      service.createAppointment({
        clientName: 'Doe',
        clientFirstName: 'Jane',
        clientPhone: '0102030405',
        clientEmail: 'jane@example.com',
        serviceName: 'Soin',
        appointmentDate: '2026-06-23T08:00:00.000Z',
        startTime: '10:00',
        endTime: '11:00',
        slotId: 'slot-daily',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prisma.appointment.create).not.toHaveBeenCalled();
  });
});
