import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface AvailabilitySlotRecord {
  id: string;
  serviceName: string | null;
  startAt: string;
  endAt: string;
  recurrenceType: 'NONE' | 'DAILY' | 'WEEKLY';
  appointments: Array<{ id: string; status: string }>;
}

export interface CreateAppointmentPayload {
  clientName: string;
  clientFirstName: string;
  clientPhone: string;
  clientEmail: string;
  serviceName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  slotId: string;
}

export interface AppointmentRecord {
  id: string;
  clientName: string;
  clientFirstName: string;
  clientPhone: string;
  clientEmail: string;
  serviceName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  slotId: string | null;
}

@Injectable({ providedIn: 'root' })
export class BookingApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000';

  getAvailabilitySlots(): Observable<AvailabilitySlotRecord[]> {
    return this.http.get<AvailabilitySlotRecord[]>(`${this.apiUrl}/availability/slots`);
  }

  createAppointment(payload: CreateAppointmentPayload): Observable<AppointmentRecord> {
    return this.http.post<AppointmentRecord>(`${this.apiUrl}/appointments`, payload);
  }
}
