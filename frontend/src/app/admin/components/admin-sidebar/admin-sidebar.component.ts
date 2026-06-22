import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css',
})
export class AdminSidebarComponent {
  readonly active = input.required<'calendar' | 'slots'>();
}
