import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css',
})
export class AdminLoginComponent {
  private readonly authService = inject(AdminAuthService);
  private readonly router = inject(Router);

  protected username = 'admin';
  protected password = 'admin';
  protected readonly showPassword = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly isSuccessVisible = signal(false);
  protected readonly errorMessage = signal('');

  protected togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  protected submit(): void {
    this.errorMessage.set('');
    this.isLoading.set(true);

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.isSuccessVisible.set(true);
        setTimeout(() => {
          this.router.navigateByUrl('/admin/calendar');
        }, 900);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Identifiants invalides. Utilisez admin / admin.');
      },
    });
  }
}
