import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, RecurrenceType } from '@prisma/client';
import { AvailabilityService } from './availability.service';

describe('AvailabilityService', () => {
  const prisma = {
    availabilitySlot: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  let service: AvailabilityService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AvailabilityService(prisma as never);
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
