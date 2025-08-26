import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterOutlet, MatSidenavModule, MatListModule, MatToolbarModule, MatIconModule, RouterModule],
  template: `
  <mat-toolbar color="primary">
    <button mat-icon-button (click)="drawer.toggle()" aria-label="Menú"><mat-icon>menu</mat-icon></button>
    <span>Mi App</span>
  </mat-toolbar>

  <mat-sidenav-container class="shell">
    <mat-sidenav #drawer mode="side" [opened]="true">
      <mat-nav-list>
        <a mat-list-item [routerLink]="['/products', '001']" routerLinkActive="active">Productos</a>
        <a mat-list-item routerLink="/orders" routerLinkActive="active">Pedidos</a>
      </mat-nav-list>
    </mat-sidenav>

    <mat-sidenav-content>
      <router-outlet />
    </mat-sidenav-content>
  </mat-sidenav-container>
  `,
  styles: [`.shell{height:calc(100vh - 64px)}`]
})
export class Shell {

}
