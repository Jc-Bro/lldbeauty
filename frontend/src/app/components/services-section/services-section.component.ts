import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { ServiceCard } from '../../client-data/site-content';

@Component({
  selector: 'app-services-section',
  imports: [CommonModule],
  templateUrl: './services-section.component.html',
  styleUrl: './services-section.component.css',
})
export class ServicesSectionComponent {
  readonly cards = input.required<ServiceCard[]>();
  readonly visual = input.required<{
    imageUrl: string;
    imageAlt: string;
    quote: string;
  }>();
}
