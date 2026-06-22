import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { FooterLink } from '../../client-data/site-content';

@Component({
  selector: 'app-site-footer',
  imports: [CommonModule],
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.css',
})
export class SiteFooterComponent {
  readonly brand = input.required<string>();
  readonly links = input.required<FooterLink[]>();
  readonly copyright = input.required<string>();
}
