import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { BookingServiceOption } from '../../client-data/site-content';
import {
  AvailabilitySlotRecord,
  BookingApiService,
  CreateAppointmentPayload,
} from '../../services/booking-api.service';

interface BookingMonthView {
  key: string;
  label: string;
}

interface BookingDayView {
  label: string;
  dateKey: string;
  currentMonth: boolean;
  active: boolean;
  available: boolean;
}

interface BookingFormState {
  clientName: string;
  clientFirstName: string;
  clientPhone: string;
  clientEmail: string;
  serviceName: string;
}

@Component({
  selector: 'app-booking-section',
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-section.component.html',
  styleUrl: './booking-section.component.css',
})
export class BookingSectionComponent implements OnInit {
  private readonly bookingApi = inject(BookingApiService);

  readonly intro = input.required<{
    title: string;
    description: string;
    availabilityLabel: string;
    confirmationLabel: string;
  }>();

  readonly serviceOptions = input.required<BookingServiceOption[]>();
  readonly weekdays = input.required<string[]>();

  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly availableSlots = signal<AvailabilitySlotRecord[]>([]);
  protected readonly selectedMonthKey = signal(this.toMonthKey(new Date()));
  protected readonly selectedDateKey = signal<string | null>(null);
  protected readonly selectedSlotId = signal<string | null>(null);
  protected readonly bookingForm = signal<BookingFormState>({
    clientName: '',
    clientFirstName: '',
    clientPhone: '',
    clientEmail: '',
    serviceName: '',
  });

  protected readonly months = computed<BookingMonthView[]>(() => {
    const monthMap = new Map<string, BookingMonthView>();

    monthMap.set(this.toMonthKey(new Date()), {
      key: this.toMonthKey(new Date()),
      label: this.formatMonthLabel(new Date()),
    });

    for (const slot of this.filteredReservableSlots()) {
      const slotDate = new Date(slot.startAt);
      monthMap.set(this.toMonthKey(slotDate), {
        key: this.toMonthKey(slotDate),
        label: this.formatMonthLabel(slotDate),
      });
    }

    return Array.from(monthMap.values()).sort((left, right) => left.key.localeCompare(right.key));
  });
  protected readonly days = computed<BookingDayView[]>(() => {
    const monthKey = this.selectedMonthKey();
    const [year, month] = monthKey.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const monthStartIndex = (firstDay.getDay() + 6) % 7;
    const gridStart = new Date(firstDay);
    gridStart.setDate(firstDay.getDate() - monthStartIndex);
    const monthEndIndex = (7 - ((lastDay.getDay() + 6) % 7) - 1 + 7) % 7;
    const gridEnd = new Date(lastDay);
    gridEnd.setDate(lastDay.getDate() + monthEndIndex);
    const days: BookingDayView[] = [];

    for (const cursor = new Date(gridStart); cursor <= gridEnd; cursor.setDate(cursor.getDate() + 1)) {
      const dateKey = this.toDateKey(cursor);
      days.push({
        label: String(cursor.getDate()),
        dateKey,
        currentMonth: cursor.getMonth() === month - 1,
        active: this.selectedDateKey() === dateKey,
        available: this.dateSlots(dateKey).length > 0,
      });
    }

    return days;
  });

  protected readonly timeSlots = computed(() =>
    this.dateSlots(this.selectedDateKey()).map((slot) => ({
      id: slot.id,
      label: this.formatSlotLabel(slot.startAt),
    })),
  );

  protected readonly availabilityLabel = computed(() => {
    const selectedDateKey = this.selectedDateKey();

    if (!selectedDateKey) {
      return `${this.intro().availabilityLabel} une date`;
    }

    return `${this.intro().availabilityLabel} ${this.formatLongDate(selectedDateKey)}`;
  });
  protected readonly selectedDateLabel = computed(() => {
    const selectedDateKey = this.selectedDateKey();
    return selectedDateKey ? this.formatLongDate(selectedDateKey) : 'Aucune date selectionnee';
  });
  protected readonly canGoToPreviousMonth = computed(() => {
    const months = this.months();
    return months.findIndex((month) => month.key === this.selectedMonthKey()) > 0;
  });
  protected readonly canGoToNextMonth = computed(() => {
    const months = this.months();
    const currentIndex = months.findIndex((month) => month.key === this.selectedMonthKey());
    return currentIndex !== -1 && currentIndex < months.length - 1;
  });
  protected readonly canGoToPreviousDate = computed(() => {
    return Boolean(this.selectedDateKey());
  });
  protected readonly canGoToNextDate = computed(() => {
    return Boolean(this.selectedDateKey());
  });

  protected readonly canSubmit = computed(() => {
    const form = this.bookingForm();

    return Boolean(
      form.clientName.trim() &&
        form.clientFirstName.trim() &&
        form.clientPhone.trim() &&
        form.clientEmail.trim() &&
        form.serviceName.trim() &&
        this.selectedSlotId() &&
        !this.submitting(),
    );
  });

  ngOnInit(): void {
    const defaultService = this.serviceOptions()[0]?.label ?? '';
    this.bookingForm.update((current) => ({ ...current, serviceName: defaultService }));
    this.loadSlots();
  }

  protected selectMonth(monthKey: string): void {
    this.selectedMonthKey.set(monthKey);
    this.syncSelectedDate();
  }

  protected selectPreviousMonth(): void {
    this.shiftMonth(-1);
  }

  protected selectNextMonth(): void {
    this.shiftMonth(1);
  }

  protected selectDay(day: BookingDayView): void {
    this.selectedDateKey.set(day.dateKey);
    this.syncSelectedSlot();
  }

  protected selectSlot(slotId: string): void {
    this.selectedSlotId.set(slotId);
  }

  protected selectPreviousDate(): void {
    this.shiftDate(-1);
  }

  protected selectNextDate(): void {
    this.shiftDate(1);
  }

  protected updateServiceName(serviceName: string): void {
    this.bookingForm.update((current) => ({ ...current, serviceName }));
    this.syncSelectedDate();
  }

  protected updateField(field: keyof BookingFormState, value: string): void {
    this.bookingForm.update((current) => ({ ...current, [field]: value }));
  }

  protected confirmBooking(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.canSubmit()) {
      this.errorMessage.set(
        'Merci de renseigner votre nom, votre prenom, votre telephone, votre email et de choisir un creneau.',
      );
      return;
    }

    const selectedSlot = this.dateSlots(this.selectedDateKey()).find(
      (slot) => slot.id === this.selectedSlotId(),
    );

    if (!selectedSlot) {
      this.errorMessage.set('Le creneau selectionne n\'est plus disponible.');
      return;
    }

    const form = this.bookingForm();
    const payload: CreateAppointmentPayload = {
      clientName: form.clientName.trim(),
      clientFirstName: form.clientFirstName.trim(),
      clientPhone: form.clientPhone.trim(),
      clientEmail: form.clientEmail.trim(),
      serviceName: form.serviceName.trim(),
      appointmentDate: selectedSlot.startAt,
      startTime: this.formatTime(selectedSlot.startAt),
      endTime: this.formatTime(selectedSlot.endAt),
      slotId: selectedSlot.sourceSlotId ?? selectedSlot.id,
    };

    this.submitting.set(true);
    this.bookingApi.createAppointment(payload).subscribe({
      next: () => {
        this.successMessage.set('Votre rendez-vous est enregistre.');
        this.bookingForm.update((current) => ({
          ...current,
          clientName: '',
          clientFirstName: '',
          clientPhone: '',
          clientEmail: '',
        }));
        this.loadSlots();
      },
      error: () => {
        this.errorMessage.set('Impossible d\'enregistrer le rendez-vous pour le moment.');
        this.submitting.set(false);
      },
    });
  }

  private loadSlots(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.bookingApi.getAvailabilitySlots().subscribe({
      next: (slots) => {
        this.availableSlots.set(slots);
        this.loading.set(false);
        this.syncSelectedDate();
        this.submitting.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Impossible de charger les disponibilites.');
      },
    });
  }

  private filteredReservableSlots(): AvailabilitySlotRecord[] {
    const now = Date.now();
    const selectedService = this.bookingForm().serviceName.trim();

    return this.availableSlots()
      .filter((slot) => new Date(slot.startAt).getTime() >= now)
      .filter((slot) => slot.appointments.every((appointment) => appointment.status === 'CANCELLED'))
      .filter((slot) => !slot.serviceName || !selectedService || slot.serviceName === selectedService)
      .sort((left, right) => left.startAt.localeCompare(right.startAt));
  }

  private dateSlots(dateKey: string | null): AvailabilitySlotRecord[] {
    if (!dateKey) {
      return [];
    }

    return this.filteredReservableSlots().filter((slot) => this.toDateKey(new Date(slot.startAt)) === dateKey);
  }

  private syncSelectedDate(): void {
    const currentDateKey = this.selectedDateKey();
    const selectedMonthKey = this.selectedMonthKey();

    if (!currentDateKey) {
      this.selectedDateKey.set(this.defaultDateKeyForMonth(selectedMonthKey));
      this.syncSelectedSlot();
      return;
    }

    if (currentDateKey.slice(0, 7) !== selectedMonthKey) {
      this.selectedDateKey.set(this.alignDateKeyToMonth(currentDateKey, selectedMonthKey));
    }

    this.syncSelectedSlot();
  }

  private shiftMonth(direction: -1 | 1): void {
    const months = this.months();
    const currentIndex = months.findIndex((month) => month.key === this.selectedMonthKey());

    if (currentIndex === -1) {
      return;
    }

    const nextMonth = months[currentIndex + direction];

    if (nextMonth) {
      this.selectMonth(nextMonth.key);
    }
  }

  private shiftDate(direction: -1 | 1): void {
    const currentDateKey = this.selectedDateKey();

    if (!currentDateKey) {
      return;
    }

    const nextDate = this.fromDateKey(currentDateKey);
    nextDate.setDate(nextDate.getDate() + direction);
    const nextDateKey = this.toDateKey(nextDate);

    const nextMonthKey = nextDateKey.slice(0, 7);
    this.selectedMonthKey.set(nextMonthKey);
    this.selectedDateKey.set(nextDateKey);
    this.syncSelectedSlot();
  }

  private syncSelectedSlot(): void {
    const currentSlotId = this.selectedSlotId();
    const slots = this.timeSlots();

    if (!slots.length) {
      this.selectedSlotId.set(null);
      return;
    }

    if (!currentSlotId || !slots.some((slot) => slot.id === currentSlotId)) {
      this.selectedSlotId.set(slots[0]?.id ?? null);
    }
  }

  private defaultDateKeyForMonth(monthKey: string): string {
    const today = new Date();

    if (this.toMonthKey(today) === monthKey) {
      return this.toDateKey(today);
    }

    const [year, month] = monthKey.split('-').map(Number);
    return this.toDateKey(new Date(year, month - 1, 1));
  }

  private alignDateKeyToMonth(dateKey: string, monthKey: string): string {
    const currentDate = this.fromDateKey(dateKey);
    const [year, month] = monthKey.split('-').map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    const day = Math.min(currentDate.getDate(), lastDay);

    return this.toDateKey(new Date(year, month - 1, day));
  }

  private fromDateKey(dateKey: string): Date {
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private toMonthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private toDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`;
  }

  private formatMonthLabel(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  private formatLongDate(dateKey: string): string {
    const [year, month, day] = dateKey.split('-').map(Number);

    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(year, month - 1, day));
  }

  private formatSlotLabel(value: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(value));
  }

  private formatTime(value: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(value));
  }
}
