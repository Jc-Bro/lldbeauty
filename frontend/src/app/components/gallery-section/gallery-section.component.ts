import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { GalleryItem } from '../../client-data/site-content';

@Component({
  selector: 'app-gallery-section',
  imports: [CommonModule],
  templateUrl: './gallery-section.component.html',
  styleUrl: './gallery-section.component.css',
})
export class GallerySectionComponent {
  readonly items = input.required<GalleryItem[]>();
}
