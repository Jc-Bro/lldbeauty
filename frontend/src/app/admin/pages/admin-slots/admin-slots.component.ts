import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';

type RecurrenceMode = 'none' | 'daily' | 'weekly';

interface RecentSlot {
  label: string;
  detail: string;
  icon: string;
}

@Component({
  selector: 'app-admin-slots',
  imports: [CommonModule, AdminSidebarComponent],
  templateUrl: './admin-slots.component.html',
  styleUrl: './admin-slots.component.css',
})
export class AdminSlotsComponent {
  protected readonly recurrence = signal<RecurrenceMode>('none');
  protected readonly recentSlots: RecentSlot[] = [
    {
      label: 'Mercredi 14 Octobre',
      detail: '09:00 - 11:30 • Soin Visage Signature',
      icon: 'schedule',
    },
    {
      label: 'Mercredi 14 Octobre',
      detail: '14:00 - 18:00 • Session Apres-midi',
      icon: 'schedule',
    },
    {
      label: 'Tous les Jeudis (Repetition)',
      detail: '08:00 - 12:00 • Creneaux du matin',
      icon: 'repeat',
    },
  ];

  protected setRecurrence(mode: RecurrenceMode): void {
    this.recurrence.set(mode);
  }
}
