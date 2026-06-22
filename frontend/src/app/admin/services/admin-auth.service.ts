import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

interface LoginResponse {
  token: string;
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'lldbeauty-admin-token';
  private readonly apiUrl = 'http://localhost:3000/auth';

  login(username: string, password: string): Observable<void> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((response) => localStorage.setItem(this.storageKey, response.token)),
        map(() => void 0),
      );
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.storageKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.storageKey);
  }
}
