import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, RecurrenceType } from '@prisma/client';
import { AvailabilityService } from './availability.service';

describe('AvailabilityService', () => {
  const prisma = {
    availabilitySlot: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  let service: AvailabilityService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-22T10:00:00.000Z'));
    service = new AvailabilityService(prisma as never);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns a future one-off slot unchanged', async () => {
    prisma.availabilitySlot.findMany.mockResolvedValue([
      {
        id: 'slot-none',
        serviceName: 'Soin',
        startAt: new Date('2026-06-25T08:00:00.000Z'),
        endAt: new Date('2026-06-25T09:00:00.000Z'),
        recurrenceType: RecurrenceType.NONE,
        createdAt: new Date('2026-06-20T08:00:00.000Z'),
        updatedAt: new Date('2026-06-20T08:00:00.000Z'),
        appointments: [],
      },
    ]);

    await expect(service.listSlots()).resolves.toEqual([
      expect.objectContaining({
        id: 'slot-none',
        recurrenceType: RecurrenceType.NONE,
        startAt: new Date('2026-06-25T08:00:00.000Z'),
        endAt: new Date('2026-06-25T09:00:00.000Z'),
      }),
    ]);
  });

  it('filters out past one-off slots', async () => {
    prisma.availabilitySlot.findMany.mockResolvedValue([
      {
        id: 'slot-past',
        serviceName: 'Soin',
        startAt: new Date('2026-06-21T08:00:00.000Z'),
        endAt: new Date('2026-06-21T09:00:00.000Z'),
        recurrenceType: RecurrenceType.NONE,
        createdAt: new Date('2026-06-20T08:00:00.000Z'),
        updatedAt: new Date('2026-06-20T08:00:00.000Z'),
        appointments: [],
      },
    ]);

    await expect(service.listSlots()).resolves.toEqual([]);
  });

  it('expands a daily recurring slot into future daily occurrences', async () => {
    prisma.availabilitySlot.findMany.mockResolvedValue([
      {
        id: 'slot-daily',
        serviceName: 'Soin',
        startAt: new Date('2026-06-20T08:00:00.000Z'),
        endAt: new Date('2026-06-20T09:00:00.000Z'),
        recurrenceType: RecurrenceType.DAILY,
        createdAt: new Date('2026-06-20T06:00:00.000Z'),
        updatedAt: new Date('2026-06-20T06:00:00.000Z'),
        appointments: [],
      },
    ]);

    const slots = await service.listSlots();

    expect(slots).toHaveLength(90);
    expect(slots[0]).toEqual(
      expect.objectContaining({
        id: 'slot-daily:2026-06-23T08:00:00.000Z',
        sourceSlotId: 'slot-daily',
        recurrenceType: RecurrenceType.DAILY,
        startAt: new Date('2026-06-23T08:00:00.000Z'),
        endAt: new Date('2026-06-23T09:00:00.000Z'),
      }),
    );
    expect(slots.at(-1)).toEqual(
      expect.objectContaining({
        startAt: new Date('2026-09-20T08:00:00.000Z'),
        endAt: new Date('2026-09-20T09:00:00.000Z'),
      }),
    );
  });

  it('expands a weekly recurring slot into future weekly occurrences', async () => {
    prisma.availabilitySlot.findMany.mockResolvedValue([
      {
        id: 'slot-weekly',
        serviceName: 'Massage',
        startAt: new Date('2026-06-15T08:00:00.000Z'),
        endAt: new Date('2026-06-15T09:30:00.000Z'),
        recurrenceType: RecurrenceType.WEEKLY,
        createdAt: new Date('2026-06-10T06:00:00.000Z'),
        updatedAt: new Date('2026-06-10T06:00:00.000Z'),
        appointments: [],
      },
    ]);

    const slots = await service.listSlots();

    expect(slots[0]).toEqual(
      expect.objectContaining({
        id: 'slot-weekly:2026-06-29T08:00:00.000Z',
        sourceSlotId: 'slot-weekly',
        recurrenceType: RecurrenceType.WEEKLY,
        startAt: new Date('2026-06-29T08:00:00.000Z'),
        endAt: new Date('2026-06-29T09:30:00.000Z'),
      }),
    );
    expect(slots).toHaveLength(12);
  });

  it('keeps only appointments linked to the expanded occurrence', async () => {
    prisma.availabilitySlot.findMany.mockResolvedValue([
      {
        id: 'slot-daily',
        serviceName: 'Soin',
        startAt: new Date('2026-06-20T08:00:00.000Z'),
        endAt: new Date('2026-06-20T09:00:00.000Z'),
        recurrenceType: RecurrenceType.DAILY,
        createdAt: new Date('2026-06-20T06:00:00.000Z'),
        updatedAt: new Date('2026-06-20T06:00:00.000Z'),
        appointments: [
          {
            id: 'appt-1',
            appointmentDate: new Date('2026-06-23T08:00:00.000Z'),
            status: AppointmentStatus.PENDING,
          },
          {
            id: 'appt-2',
            appointmentDate: new Date('2026-06-24T08:00:00.000Z'),
            status: AppointmentStatus.CANCELLED,
          },
        ],
      },
    ]);

    const slots = await service.listSlots();

    expect(slots[0]?.appointments).toEqual([
      expect.objectContaining({ id: 'appt-1', status: AppointmentStatus.PENDING }),
    ]);
    expect(slots[1]?.appointments).toEqual([
      expect.objectContaining({ id: 'appt-2', status: AppointmentStatus.CANCELLED }),
    ]);
  });

  it('keeps the same slot duration for each expanded occurrence', async () => {
    prisma.availabilitySlot.findMany.mockResolvedValue([
      {
        id: 'slot-weekly',
        serviceName: 'Massage',
        startAt: new Date('2026-06-15T08:00:00.000Z'),
        endAt: new Date('2026-06-15T09:30:00.000Z'),
        recurrenceType: RecurrenceType.WEEKLY,
        createdAt: new Date('2026-06-10T06:00:00.000Z'),
        updatedAt: new Date('2026-06-10T06:00:00.000Z'),
        appointments: [],
      },
    ]);

    const slots = await service.listSlots();

    for (const slot of slots) {
      expect(slot.endAt.getTime() - slot.startAt.getTime()).toBe(90 * 60 * 1000);
      expect(slot.startAt.getUTCDay()).toBe(1);
    }
  });

  it('deletes an unbooked slot', async () => {
    prisma.availabilitySlot.findUnique.mockResolvedValue({
      id: 'slot-1',
      serviceName: 'Soin',
      startAt: new Date('2026-06-25T08:00:00.000Z'),
      endAt: new Date('2026-06-25T09:00:00.000Z'),
      recurrenceType: RecurrenceType.NONE,
      createdAt: new Date('2026-06-22T08:00:00.000Z'),
      updatedAt: new Date('2026-06-22T08:00:00.000Z'),
      appointments: [],
    });
    prisma.availabilitySlot.delete.mockResolvedValue({ id: 'slot-1' });

    await expect(service.deleteSlot('slot-1')).resolves.toEqual({ id: 'slot-1' });
    expect(prisma.availabilitySlot.delete).toHaveBeenCalledWith({ where: { id: 'slot-1' } });
  });

  it('creates a slot with an optional trimmed service name', async () => {
    prisma.availabilitySlot.create.mockResolvedValue({ id: 'slot-3' });

    await expect(
      service.createSlot({
        serviceName: '  Soin signature  ',
        startAt: '2026-06-25T08:00:00.000Z',
        endAt: '2026-06-25T09:00:00.000Z',
        recurrenceType: RecurrenceType.NONE,
      }),
    ).resolves.toEqual({ id: 'slot-3' });

    expect(prisma.availabilitySlot.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ serviceName: 'Soin signature' }),
    });
  });

  it('rejects slot creation when dates are invalid', async () => {
    expect(() =>
      service.createSlot({
        startAt: 'invalid-date',
        endAt: '2026-06-25T09:00:00.000Z',
      }),
    ).toThrow(BadRequestException);

    expect(prisma.availabilitySlot.create).not.toHaveBeenCalled();
  });

  it('rejects slot creation when end time is not after start time', async () => {
    expect(() =>
      service.createSlot({
        startAt: '2026-06-25T09:00:00.000Z',
        endAt: '2026-06-25T09:00:00.000Z',
      }),
    ).toThrow(BadRequestException);

    expect(prisma.availabilitySlot.create).not.toHaveBeenCalled();
  });

  it('rejects deletion when a slot has an active appointment', async () => {
    prisma.availabilitySlot.findUnique.mockResolvedValue({
      id: 'slot-2',
      appointments: [{ id: 'appt-1', status: AppointmentStatus.PENDING }],
    });

    await expect(service.deleteSlot('slot-2')).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.availabilitySlot.delete).not.toHaveBeenCalled();
  });

  it('throws when the slot does not exist', async () => {
    prisma.availabilitySlot.findUnique.mockResolvedValue(null);

    await expect(service.deleteSlot('missing-slot')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.availabilitySlot.delete).not.toHaveBeenCalled();
  });
});
