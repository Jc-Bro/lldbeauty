import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { ContactDetail } from '../../client-data/site-content';

@Component({
  selector: 'app-contact-section',
  imports: [CommonModule],
  templateUrl: './contact-section.component.html',
  styleUrl: './contact-section.component.css',
})
export class ContactSectionComponent {
  readonly intro = input.required<{
    title: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    messagePlaceholder: string;
    submitLabel: string;
  }>();

  readonly details = input.required<ContactDetail[]>();
}
