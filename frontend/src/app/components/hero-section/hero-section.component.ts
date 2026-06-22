import { Component, input } from '@angular/core';
import { HeroContent } from '../../client-data/site-content';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.css',
})
export class HeroSectionComponent {
  readonly content = input.required<HeroContent>();
}
