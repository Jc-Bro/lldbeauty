import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';
import { AdminAuthService } from '../../services/admin-auth.service';

interface AppointmentCard {
  id: string;
  customer: string;
  service: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  dayIndex: number;
  top: string;
  height: string;
}

interface AdminAppointmentRecord {
  id: string;
  clientName: string;
  clientFirstName: string;
  serviceName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  slotId: string | null;
}

interface CalendarDay {
  label: string;
  dayNumber: string;
  isoDate: string;
  isToday: boolean;
  isWeekend: boolean;
}

@Component({
  selector: 'app-admin-calendar',
  imports: [CommonModule, RouterLink, AdminSidebarComponent],
  templateUrl: './admin-calendar.component.html',
  styleUrl: './admin-calendar.component.css',
})
export class AdminCalendarComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly adminAuth = inject(AdminAuthService);
  private readonly apiUrl = 'http://localhost:3000/appointments';

  protected readonly hours = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  ];

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly currentWeekStart = signal(this.startOfWeek(new Date()));
  protected readonly appointments = signal<AdminAppointmentRecord[]>([]);
  protected readonly weekDays = computed<CalendarDay[]>(() => {
    const weekStart = this.currentWeekStart();

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);

      return {
        label: new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(date),
        dayNumber: new Intl.DateTimeFormat('fr-FR', { day: 'numeric' }).format(date),
        isoDate: this.toDateKey(date),
        isToday: this.toDateKey(date) === this.toDateKey(new Date()),
        isWeekend: index >= 5,
      };
    });
  });
  protected readonly weekLabel = computed(() => {
    const weekStart = this.currentWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return `${this.formatRangeDate(weekStart)} - ${this.formatRangeDate(weekEnd, true)}`;
  });
  protected readonly appointmentCards = computed<AppointmentCard[]>(() => {
    const weekDays = this.weekDays();

    return this.appointments()
      .filter((appointment) => !!appointment.slotId)
      .map((appointment) => {
        const appointmentDate = new Date(appointment.appointmentDate);
        const dateKey = this.toDateKey(appointmentDate);
        const dayIndex = weekDays.findIndex((day) => day.isoDate === dateKey);

        if (dayIndex === -1) {
          return null;
        }

        const startMinutes = this.timeToMinutes(appointment.startTime);
        const endMinutes = this.timeToMinutes(appointment.endTime);
        const minutesFromCalendarStart = Math.max(startMinutes - 8 * 60, 0);
        const duration = Math.max(endMinutes - startMinutes, 45);
        const pixelsPerMinute = 96 / 60;

        return {
          id: appointment.id,
          customer: `${appointment.clientFirstName} ${appointment.clientName}`,
          service: appointment.serviceName,
          time: `${appointment.startTime} - ${appointment.endTime}`,
          status: appointment.status.toLowerCase() as AppointmentCard['status'],
          dayIndex,
          top: `${minutesFromCalendarStart * pixelsPerMinute}px`,
          height: `${duration * pixelsPerMinute}px`,
        };
      })
      .filter((appointment): appointment is AppointmentCard => appointment !== null);
  });

  ngOnInit(): void {
    this.loadAppointments();
  }

  protected previousWeek(): void {
    const nextValue = new Date(this.currentWeekStart());
    nextValue.setDate(nextValue.getDate() - 7);
    this.currentWeekStart.set(this.startOfWeek(nextValue));
  }

  protected nextWeek(): void {
    const nextValue = new Date(this.currentWeekStart());
    nextValue.setDate(nextValue.getDate() + 7);
    this.currentWeekStart.set(this.startOfWeek(nextValue));
  }

  protected appointmentStyle(appointment: AppointmentCard) {
    return {
      top: appointment.top,
      left: `calc(80px + (${appointment.dayIndex} * ((100% - 80px) / 7)))`,
      height: appointment.height,
    };
  }

  private loadAppointments(): void {
    const token = this.adminAuth.getToken();

    if (!token) {
      this.loading.set(false);
      this.errorMessage.set('Connectez-vous pour consulter les rendez-vous.');
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<AdminAppointmentRecord[]>(this.apiUrl, { headers }).subscribe({
      next: (appointments) => {
        this.appointments.set(appointments);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Impossible de charger les rendez-vous.');
      },
    });
  }

  private startOfWeek(date: Date): Date {
    const normalized = new Date(date);
    const dayIndex = (normalized.getDay() + 6) % 7;
    normalized.setHours(0, 0, 0, 0);
    normalized.setDate(normalized.getDate() - dayIndex);
    return normalized;
  }

  private toDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`;
  }

  private formatRangeDate(date: Date, includeMonth = false): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      ...(includeMonth ? { month: 'long', year: 'numeric' } : {}),
    }).format(date);
  }

  private timeToMinutes(value: string): number {
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
