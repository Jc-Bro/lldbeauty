import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
  serviceName: string | null;
  startAt: string;
  endAt: string;
  recurrenceType: 'NONE' | 'DAILY' | 'WEEKLY';
  appointments: Array<{ id: string; status: string }>;
}

@Component({
  selector: 'app-admin-slots',
  imports: [CommonModule, AdminSidebarComponent],
  templateUrl: './admin-slots.component.html',
  styleUrl: './admin-slots.component.css',
})
export class AdminSlotsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly adminAuth = inject(AdminAuthService);
  private readonly apiUrl = 'http://localhost:3000/availability/slots';

  protected readonly recurrence = signal<RecurrenceMode>('none');
  protected readonly loadingRecentSlots = signal(true);
  protected readonly recentSlotsError = signal('');
  protected readonly recentSlots = signal<RecentSlot[]>([]);
  protected readonly hasRecentSlots = computed(() => this.recentSlots().length > 0);

  ngOnInit(): void {
    this.loadRecentSlots();
  }

  protected setRecurrence(mode: RecurrenceMode): void {
    this.recurrence.set(mode);
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

  private toRecentSlot(slot: AvailabilitySlotRecord): RecentSlot {
    const startAt = new Date(slot.startAt);
    const endAt = new Date(slot.endAt);

    return {
      id: slot.id,
      label:
        slot.recurrenceType === 'WEEKLY'
          ? `Chaque ${new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(startAt)}`
          : new Intl.DateTimeFormat('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }).format(startAt),
      detail: `${this.formatTime(startAt)} - ${this.formatTime(endAt)}${slot.serviceName ? ` • ${slot.serviceName}` : ''}`,
      icon: slot.recurrenceType === 'NONE' ? 'schedule' : 'repeat',
      isDeleting: false,
    };
  }

  private formatTime(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }

  private setDeletingState(slotId: string, isDeleting: boolean): void {
    this.recentSlots.update((slots) =>
      slots.map((slot) => (slot.id === slotId ? { ...slot, isDeleting } : slot)),
    );
  }
}
