import { Component } from '@angular/core';
import {
  bookingDays,
  bookingIntro,
  bookingMonths,
  bookingServiceOptions,
  bookingTimeSlots,
  bookingWeekdays,
  contactDetails,
  contactIntro,
  footerBrand,
  footerCopyright,
  footerLinks,
  galleryItems,
  heroContent,
  navLinks,
  serviceCards,
  servicesVisual,
  siteBrand,
} from '../../client-data/site-content';
import { BookingSectionComponent } from '../../components/booking-section/booking-section.component';
import { ContactSectionComponent } from '../../components/contact-section/contact-section.component';
import { SiteFooterComponent } from '../../components/site-footer/site-footer.component';
import { GallerySectionComponent } from '../../components/gallery-section/gallery-section.component';
import { HeroSectionComponent } from '../../components/hero-section/hero-section.component';
import { ServicesSectionComponent } from '../../components/services-section/services-section.component';
import { SiteHeaderComponent } from '../../components/site-header/site-header.component';

@Component({
  selector: 'app-home',
  imports: [
    SiteHeaderComponent,
    HeroSectionComponent,
    ServicesSectionComponent,
    GallerySectionComponent,
    BookingSectionComponent,
    ContactSectionComponent,
    SiteFooterComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  protected readonly brand = siteBrand;
  protected readonly links = navLinks;
  protected readonly hero = heroContent;
  protected readonly services = serviceCards;
  protected readonly servicesVisual = servicesVisual;
  protected readonly gallery = galleryItems;
  protected readonly bookingIntro = bookingIntro;
  protected readonly bookingServiceOptions = bookingServiceOptions;
  protected readonly bookingMonths = bookingMonths;
  protected readonly bookingWeekdays = bookingWeekdays;
  protected readonly bookingDays = bookingDays;
  protected readonly bookingTimeSlots = bookingTimeSlots;
  protected readonly contactIntro = contactIntro;
  protected readonly contactDetails = contactDetails;
  protected readonly footerBrand = footerBrand;
  protected readonly footerLinks = footerLinks;
  protected readonly footerCopyright = footerCopyright;
}
