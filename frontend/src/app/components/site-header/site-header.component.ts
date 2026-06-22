import { CommonModule } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { NavLink } from '../../client-data/site-content';

@Component({
  selector: 'app-site-header',
  imports: [CommonModule],
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.css',
})
export class SiteHeaderComponent {
  readonly brand = input.required<string>();
  readonly links = input.required<NavLink[]>();

  protected readonly isMenuOpen = signal(false);

  protected toggleMenu(): void {
    this.isMenuOpen.update((value) => !value);
  }

  protected closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
