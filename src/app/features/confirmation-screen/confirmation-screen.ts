// order-confirmation.component.ts
import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';

type Item = { name: string; sku: string; quantity: number; price?: number };

type ConfirmationState = {
  storeName?: string;
  createdAt?: string;   // ISO string
  updatedAt?: string;   // ISO string (present if edit)
  items?: Item[];
  // opcionales si ya los calculaste antes:
  subtotal?: number;
  taxRate?: number;     // ej. 0.16
  total?: number;
};

@Component({
  selector: 'app-confirmation-screen',
  templateUrl: './confirmation-screen.html',
  styleUrls: ['./confirmation-screen.css'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatTableModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
  ],
})
export class ConfirmationScreenComponent implements OnInit {
  orderId = '';
  storeName = '';
  createdAt = new Date();
  updatedAt: Date | null = null;

  items: Item[] = [];
  displayedColumns: string[] = ['name', 'sku', 'qty', 'price', 'lineTotal'];

  totalQuantity = 0;
  hasPrices = false;

  subtotal = 0;
  taxRate = 0;       // 0.16 = 16%
  taxAmount = 0;
  total = 0;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id') ?? '';

    const state = (history.state || {}) as ConfirmationState;

    if (state?.items?.length) {
      this.hydrateFromState(state);
      this.persist();
    } else {
      const cached = localStorage.getItem('lastOrderConfirmation');
      if (cached) {
        try {
          const data = JSON.parse(cached) as ConfirmationState & { id?: string };
          if (!this.orderId || this.orderId === data.id) {
            this.hydrateFromState(data);
          }
        } catch {}
      }
    }

    // Si llegaste aquí sin items, podrías cargar del API:
    // if (!this.items.length && this.orderId) { ... }
  }

  private hydrateFromState(state: ConfirmationState): void {
    this.storeName = state.storeName ?? '';
    this.createdAt = state.createdAt ? new Date(state.createdAt) : new Date();
    this.updatedAt = state.updatedAt ? new Date(state.updatedAt) : null;

    this.items = (state.items ?? []).map(i => ({ ...i, price: i.price ?? 0 }));
    this.totalQuantity = this.items.reduce((a, i) => a + i.quantity, 0);

    // Totales
    this.hasPrices = this.items.some(i => (i.price ?? 0) > 0);

    // Usa los valores ya calculados si vienen en state; si no, calcúlalos
    this.subtotal = state.subtotal ?? this.items.reduce((a, i) => a + i.quantity * (i.price ?? 0), 0);

    this.taxRate = state.taxRate ?? 0;    // pon 0.16 si quieres 16% por defecto
    this.taxAmount = this.round2(this.subtotal * this.taxRate);

    this.total = state.total ?? this.round2(this.subtotal + this.taxAmount);
  }

  private persist(): void {
    const payload: ConfirmationState & { id: string } = {
      id: this.orderId,
      storeName: this.storeName,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt ? this.updatedAt.toISOString() : undefined,
      items: this.items,
      subtotal: this.subtotal,
      taxRate: this.taxRate,
      total: this.total,
    };
    localStorage.setItem('lastOrderConfirmation', JSON.stringify(payload));
  }

  private round2(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  newOrder() {
    this.router.navigate(['/']);
  }
}
