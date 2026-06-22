import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';
import { AdminAuthService } from '../../services/admin-auth.service';

type RecurrenceMode = 'none' | 'daily' | 'weekly';

interface RecentSlot {
  id: string;
  label: string;
  detail: string;
  icon: string;
  isDeleting: boolean;
}

interface AvailabilitySlotRecord {
  id: string;
  sourceSlotId?: string;
  serviceName: string | null;
  startAt: string;
  endAt: string;
  recurrenceType: 'NONE' | 'DAILY' | 'WEEKLY';
  appointments: Array<{ id: string; status: string }>;
}

interface SlotFormState {
  date: string;
  startTime: string;
  endTime: string;
  serviceName: string;
}

interface PreviewWeekDay {
  label: string;
  dayNumber: string;
  isoDate: string;
  isToday: boolean;
}

@Component({
  selector: 'app-admin-slots',
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  templateUrl: './admin-slots.component.html',
  styleUrl: './admin-slots.component.css',
})
export class AdminSlotsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly adminAuth = inject(AdminAuthService);
  private readonly apiUrl = 'http://localhost:3000/availability/slots';

  protected readonly recurrence = signal<RecurrenceMode>('none');
  protected readonly loadingPreviewSlots = signal(true);
  protected readonly previewSlotsError = signal('');
  protected readonly availabilitySlots = signal<AvailabilitySlotRecord[]>([]);
  protected readonly loadingRecentSlots = signal(true);
  protected readonly recentSlotsError = signal('');
  protected readonly recentSlots = signal<RecentSlot[]>([]);
  protected readonly hasRecentSlots = computed(() => this.recentSlots().length > 0);
  protected readonly hasPreviewSlots = computed(() =>
    this.previewWeekDays().some((day) => this.slotsForDate(day.isoDate).length > 0),
  );
  protected readonly currentWeekStart = signal(this.startOfWeek(new Date()));
  protected readonly previewWeekDays = computed<PreviewWeekDay[]>(() => {
    const weekStart = this.currentWeekStart();

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);

      return {
        label: new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(date),
        dayNumber: new Intl.DateTimeFormat('fr-FR', { day: 'numeric' }).format(date),
        isoDate: this.toDateKey(date),
        isToday: this.toDateKey(date) === this.toDateKey(new Date()),
      };
    });
  });
  protected readonly formState = signal<SlotFormState>({
    date: '',
    startTime: '',
    endTime: '',
    serviceName: '',
  });
  protected readonly isSubmitting = signal(false);
  protected readonly createSuccessMessage = signal('');
  protected readonly createErrorMessage = signal('');
  protected readonly canSubmit = computed(() => {
    const form = this.formState();
    return Boolean(form.date && form.startTime && form.endTime && !this.isSubmitting());
  });

  ngOnInit(): void {
    this.loadPreviewSlots();
    this.loadRecentSlots();
  }

  protected setRecurrence(mode: RecurrenceMode): void {
    this.recurrence.set(mode);
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

  protected updateField(field: keyof SlotFormState, value: string): void {
    this.formState.update((current) => ({ ...current, [field]: value }));
  }

  protected createSlot(): void {
    this.createSuccessMessage.set('');
    this.createErrorMessage.set('');

    if (!this.canSubmit()) {
      this.createErrorMessage.set('Merci de renseigner la date, l\'heure de debut et l\'heure de fin.');
      return;
    }

    const token = this.adminAuth.getToken();

    if (!token) {
      this.createErrorMessage.set('Connectez-vous pour creer un creneau.');
      return;
    }

    const form = this.formState();
    const startAt = new Date(`${form.date}T${form.startTime}`);
    const endAt = new Date(`${form.date}T${form.endTime}`);

    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      this.createErrorMessage.set('Les dates ou horaires saisis sont invalides.');
      return;
    }

    this.isSubmitting.set(true);

    this.http
      .post<AvailabilitySlotRecord>(
        this.apiUrl,
        {
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          serviceName: form.serviceName.trim() || undefined,
          recurrenceType: this.toRecurrenceType(this.recurrence()),
        },
        { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) },
      )
        .subscribe({
        next: () => {
          this.createSuccessMessage.set(this.successMessageFor(this.recurrence()));
          this.formState.set({ date: '', startTime: '', endTime: '', serviceName: '' });
          this.recurrence.set('none');
          this.isSubmitting.set(false);
          this.loadPreviewSlots();
          this.loadRecentSlots();
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.createErrorMessage.set(
            error?.error?.message ?? 'Impossible d\'enregistrer ce creneau pour le moment.',
          );
        },
      });
  }

  protected deleteSlot(slotId: string): void {
    const token = this.adminAuth.getToken();

    if (!token) {
      this.recentSlotsError.set('Connectez-vous pour supprimer un creneau.');
      return;
    }

    this.setDeletingState(slotId, true);
    this.recentSlotsError.set('');

    this.http
      .delete<void>(`${this.apiUrl}/${slotId}`, {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      })
      .subscribe({
        next: () => {
          this.recentSlots.update((slots) => slots.filter((slot) => slot.id !== slotId));
          this.loadPreviewSlots();
        },
        error: (error) => {
          const message = error?.status === 409
            ? 'Impossible de supprimer un creneau deja reserve.'
            : 'Impossible de supprimer ce creneau.';
          this.recentSlotsError.set(message);
          this.setDeletingState(slotId, false);
        },
      });
  }

  private loadRecentSlots(): void {
    const token = this.adminAuth.getToken();

    if (!token) {
      this.loadingRecentSlots.set(false);
      this.recentSlotsError.set('Connectez-vous pour consulter les creneaux recents.');
      return;
    }

    this.loadingRecentSlots.set(true);
    this.recentSlotsError.set('');

    this.http
      .get<AvailabilitySlotRecord[]>(`${this.apiUrl}/recent`, {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      })
      .subscribe({
        next: (slots) => {
          this.recentSlots.set(slots.map((slot) => this.toRecentSlot(slot)));
          this.loadingRecentSlots.set(false);
        },
        error: () => {
          this.loadingRecentSlots.set(false);
          this.recentSlotsError.set('Impossible de charger les creneaux recents.');
        },
      });
  }

  private loadPreviewSlots(): void {
    this.loadingPreviewSlots.set(true);
    this.previewSlotsError.set('');

    this.http.get<AvailabilitySlotRecord[]>(this.apiUrl).subscribe({
      next: (slots) => {
        this.availabilitySlots.set(slots);
        this.loadingPreviewSlots.set(false);
      },
      error: () => {
        this.loadingPreviewSlots.set(false);
        this.previewSlotsError.set('Impossible de charger l\'apercu des creneaux.');
      },
    });
  }

  protected slotsForDate(dateKey: string): AvailabilitySlotRecord[] {
    return this.availabilitySlots()
      .filter((slot) => this.toDateKey(new Date(slot.startAt)) === dateKey)
      .sort((left, right) => left.startAt.localeCompare(right.startAt));
  }

  protected slotTimeRange(slot: AvailabilitySlotRecord): string {
    return `${this.formatTime(new Date(slot.startAt))} - ${this.formatTime(new Date(slot.endAt))}`;
  }

  private toRecurrenceType(mode: RecurrenceMode): 'NONE' | 'DAILY' | 'WEEKLY' {
    if (mode === 'daily') {
      return 'DAILY';
    }

    if (mode === 'weekly') {
      return 'WEEKLY';
    }

    return 'NONE';
  }

  private startOfWeek(date: Date): Date {
    const normalized = new Date(date);
    const dayIndex = (normalized.getDay() + 6) % 7;
    normalized.setHours(0, 0, 0, 0);
    normalized.setDate(normalized.getDate() - dayIndex);
    return normalized;
  }

  private toRecentSlot(slot: AvailabilitySlotRecord): RecentSlot {
    const startAt = new Date(slot.startAt);
    const endAt = new Date(slot.endAt);
    const label =
      slot.recurrenceType === 'DAILY'
        ? 'Chaque jour'
        : slot.recurrenceType === 'WEEKLY'
          ? `Chaque ${new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(startAt)}`
          : new Intl.DateTimeFormat('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }).format(startAt);

    return {
      id: slot.id,
      label,
      detail: `${this.formatTime(startAt)} - ${this.formatTime(endAt)}${slot.serviceName ? ` • ${slot.serviceName}` : ''}`,
      icon: slot.recurrenceType === 'NONE' ? 'schedule' : 'repeat',
      isDeleting: false,
    };
  }

  private successMessageFor(mode: RecurrenceMode): string {
    if (mode === 'daily') {
      return 'Le creneau a bien ete enregistre et se repetera chaque jour.';
    }

    if (mode === 'weekly') {
      return 'Le creneau a bien ete enregistre et se repetera chaque semaine.';
    }

    return 'Le creneau a bien ete enregistre.';
  }

  protected formatTime(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }

  private toDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`;
  }

  private setDeletingState(slotId: string, isDeleting: boolean): void {
    this.recentSlots.update((slots) =>
      slots.map((slot) => (slot.id === slotId ? { ...slot, isDeleting } : slot)),
    );
  }
}
