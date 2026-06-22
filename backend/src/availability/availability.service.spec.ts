import { ConflictException, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, RecurrenceType } from '@prisma/client';
import { AvailabilityService } from './availability.service';

describe('AvailabilityService', () => {
  const prisma = {
    availabilitySlot: {
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
