import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @UseGuards(AdminAuthGuard)
  getAppointments() {
    return this.appointmentsService.listAppointments();
  }

  @Post()
  createAppointment(@Body() body: Record<string, string>) {
    return this.appointmentsService.createAppointment({
      clientName: body.clientName,
      clientFirstName: body.clientFirstName,
      clientPhone: body.clientPhone,
      clientEmail: body.clientEmail,
      serviceName: body.serviceName,
      appointmentDate: body.appointmentDate,
      startTime: body.startTime,
      endTime: body.endTime,
      slotId: body.slotId,
    });
  }
}
