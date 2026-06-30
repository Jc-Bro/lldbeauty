import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { siteImages } from '../../../client-data/site-images';

@Component({
  selector: 'app-admin-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css',
})
export class AdminSidebarComponent {
  readonly active = input.required<'calendar' | 'slots'>();
  protected readonly adminProfileImage = siteImages.adminProfile;
}
