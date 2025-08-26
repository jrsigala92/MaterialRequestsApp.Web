import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, inject } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { AuthResponse } from '../models/auth-response.model';
import { RegisterRequest } from '../models/register-request.model';
import { LoginRequest } from '../models/login-request.model';
import { API_BASE_URL } from '../utils/api-base-url.token';

@Injectable({ providedIn: 'root' })
export class AuthService {
    constructor(
    @Inject(API_BASE_URL) private baseUrl: string
  ) { }
    private http = inject(HttpClient);
  
  private resource = 'auth';

  private auth$ = new BehaviorSubject<AuthResponse | null>(this.load());
  readonly session$ = this.auth$.asObservable();
  get session(): AuthResponse | null { return this.auth$.value; }
  get isAuthenticated(): boolean { return !!this.session?.token; }

  register(req: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/${this.resource}/register`, req)
      .pipe(tap(res => this.save(res)));
  }

  login(req: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.baseUrl}/${this.resource}/login`, req)
      .pipe(tap(res => this.save(res)));
  }

  logout() {
    localStorage.removeItem('auth');
    this.auth$.next(null);
  }

  private save(res: AuthResponse) {
    localStorage.setItem('auth', JSON.stringify(res));
    this.auth$.next(res);
  }

  private load(): AuthResponse | null {
    const raw = localStorage.getItem('auth');
    try { return raw ? JSON.parse(raw) as AuthResponse : null; } catch { return null; }
  }
}
