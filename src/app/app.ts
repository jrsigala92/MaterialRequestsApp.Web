import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { AsyncPipe, CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, Observable, shareReplay } from 'rxjs';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    AsyncPipe,
    CommonModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  isHandset$: Observable<boolean>;
  toolbarHeight$: Observable<number>;

  constructor(private bp: BreakpointObserver) {
    this.isHandset$ = this.bp.observe(Breakpoints.Handset)
      .pipe(map(r => r.matches), shareReplay(1));

    this.toolbarHeight$ = this.isHandset$.pipe(
      map(isPhone => (isPhone ? 56 : 64)), // Material default heights
      shareReplay(1)
    );
  }

  protected readonly title = signal('MaterialRequestsApp.Web');
  
  auth = inject(AuthService);
  router = inject(Router);

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
