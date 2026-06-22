import { Routes } from '@angular/router';
import { adminAuthGuard } from './admin/guards/admin-auth.guard';
import { AdminCalendarComponent } from './admin/pages/admin-calendar/admin-calendar.component';
import { AdminLoginComponent } from './admin/pages/admin-login/admin-login.component';
import { AdminSlotsComponent } from './admin/pages/admin-slots/admin-slots.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'admin/login',
    component: AdminLoginComponent,
  },
  {
    path: 'admin/calendar',
    component: AdminCalendarComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin/slots',
    component: AdminSlotsComponent,
    canActivate: [adminAuthGuard],
  },
  {
    path: 'admin',
    pathMatch: 'full',
    redirectTo: 'admin/login',
  },
];
