import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { AvailabilityService } from './availability.service';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get('slots')
  getSlots() {
    return this.availabilityService.listSlots();
  }

  @Get('slots/recent')
  @UseGuards(AdminAuthGuard)
  getRecentSlots() {
    return this.availabilityService.listRecentSlots();
  }

  @Post('slots')
  @UseGuards(AdminAuthGuard)
  createSlot(@Body() body: Record<string, string>) {
    return this.availabilityService.createSlot({
      serviceName: body.serviceName,
      startAt: body.startAt,
      endAt: body.endAt,
      recurrenceType: body.recurrenceType as
        | 'NONE'
        | 'DAILY'
        | 'WEEKLY'
        | undefined,
    });
  }

  @Delete('slots/:id')
  @UseGuards(AdminAuthGuard)
  deleteSlot(@Param('id') id: string) {
    return this.availabilityService.deleteSlot(id);
  }
}
