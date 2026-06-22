import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { BookingDay, BookingMonth, BookingServiceOption } from '../../client-data/site-content';

@Component({
  selector: 'app-booking-section',
  imports: [CommonModule],
  templateUrl: './booking-section.component.html',
  styleUrl: './booking-section.component.css',
})
export class BookingSectionComponent {
  readonly intro = input.required<{
    title: string;
    description: string;
    availabilityLabel: string;
    confirmationLabel: string;
  }>();

  readonly serviceOptions = input.required<BookingServiceOption[]>();
  readonly months = input.required<BookingMonth[]>();
  readonly weekdays = input.required<string[]>();
  readonly days = input.required<BookingDay[]>();
  readonly timeSlots = input.required<string[]>();

  protected readonly selectedMonthIndex = signal(0);
  protected readonly selectedSlot = signal<string | null>(null);
  protected readonly defaultService = computed(() => this.serviceOptions()[0]?.label ?? '');

  protected selectMonth(index: number): void {
    this.selectedMonthIndex.set(index);
  }

  protected selectSlot(slot: string): void {
    this.selectedSlot.set(slot);
  }
}
