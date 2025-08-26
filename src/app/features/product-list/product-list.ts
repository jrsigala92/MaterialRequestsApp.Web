import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { Store } from '../../models/store.model';
import { CommonModule, CurrencyPipe } from '@angular/common';

// ⬇️ Add this import
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.html',
  styleUrl: './product-list.css', // if you’re on Angular <=16, use styleUrls: ['./product-list.css']
  standalone: true,
  imports: [
    MatToolbarModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
    MatInputModule,
    FormsModule,
    CurrencyPipe,
    CommonModule
  ]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  displayedColumns: string[] = ['name','sku', 'price', 'quantity'];
  footerColumns = ['totalFooter'];

  orderId: string | null = null;
  orderDate: Date | null = null;
  
  isEditMode = false;
  storeCode: string = '';
  storeName: string = localStorage.getItem('storeName') || '';
  loading: boolean = true;
  maxQuantity: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private productService: ProductService,
    private orderService: OrderService,
    private router: Router,
    // ⬇️ Inject your StoreService
    private storeService: StoreService
  ) {}

  ngOnInit(): void {
    // read possible params
    this.orderId = this.route.snapshot.paramMap.get('id'); // depends on your routing
    this.isEditMode = !!this.orderId;
    // existing behavior
    this.storeCode = this.route.snapshot.params['storeCode'] || '';

    // new: try to read storeId from params or query string (support both storeId/storeid)
    const storeId =
      this.route.snapshot.params['storeId'] ||
      this.route.snapshot.params['storeid'] ||
      this.route.snapshot.queryParamMap.get('storeId') ||
      this.route.snapshot.queryParamMap.get('storeid');

    const raw = localStorage.getItem('maxQuantity');
    const n = raw !== null ? Number(raw) : NaN;
    this.maxQuantity = Number.isFinite(n) && n > 0 ? n : null;

    if (storeId) {
      // fetch store and then continue with normal flow
      this.fetchStoreById(storeId, this.orderId!);
    } else {
      // no storeId → continue with your current behavior
      if (this.orderId) {
        this.loadOrder(this.orderId);
      } else {
        this.loadProducts();
      }
    }
  }

  private fetchStoreById(storeId: string, orderId?: string): void {
    this.loading = true;
    this.storeService.get(storeId).subscribe({
      next: (store: Store) => {
        // set UI data
        this.storeName = store.name;
        this.storeCode = store.code;

        // persist for later (submit uses localStorage storeId)
        localStorage.setItem('storeId', store.id);
        localStorage.setItem('storeName', store.name);
        localStorage.setItem('storeCode', store.code);

        // proceed to load order or products
        if (orderId) {
          this.loadOrder(orderId);
        } else {
          this.loadProducts();
        }
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('No se pudo cargar la tienda indicada.', 'Cerrar', { duration: 5000 });
        // fallback to existing behavior
        const fallbackOrderId = this.route.snapshot.params['id'];
        if (fallbackOrderId) {
          this.loadOrder(fallbackOrderId);
        } else {
          this.loadProducts();
        }
      }
    });
  }

  // get isEditMode(): boolean {
  //   return !!this.route.snapshot.params['id'];
  // }

  loadOrder(orderId: string): void {
    this.loading = true;
    this.orderService.get(orderId).subscribe({
      next: (order) => {
        this.orderDate = new Date(order.createdAt);
        this.productService.getAll().subscribe({
          next: (products) => {
            this.products = products.map(p => {
              const match = order.orderDetails.find((od: any) => od.productId === p.id);
              return { ...p, quantity: match ? match.quantity : 0 };
            });
            this.loading = false;
          },
          error: () => {
            this.loading = false;
            this.snackBar.open('Error cargando productos', 'Cerrar', { duration: 5000 });
          }
        });

        // Optional: if your order payload contains store info, you can hydrate UI from it:
        // if (order.store) {
        //   this.storeName = order.store.name;
        //   this.storeCode = order.store.code;
        // }
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error cargando pedido', 'Cerrar', { duration: 5000 });
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAll().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error cargando productos', 'Cerrar', { duration: 5000 });
      }
    });
  }

  get totalItems(): number {
    return (this.products ?? []).reduce((acc, p) => acc + (p.quantity || 0), 0);
  }

  get grandTotal(): number {
    return (this.products ?? []).reduce((sum, p) => sum + (p.quantity || 0) * (p.price || 0), 0);
  }

  get exceedsLimit(): boolean {
    return this.maxQuantity !== null && this.grandTotal > this.maxQuantity;
  }

  get overBy(): number {
    return this.maxQuantity !== null ? Math.max(0, this.grandTotal - this.maxQuantity) : 0;
  }

  updateQuantity(p: any, increase: boolean) {
    if (increase) {
      const nextTotal = this.grandTotal + p.price;
      if (this.maxQuantity !== null && nextTotal > this.maxQuantity) {
        this.snackBar.open(
          `No es posible agregar este producto. Excedería el monto destinado de $${this.maxQuantity} pesos.`,
          'Cerrar',
          { duration: 8000, horizontalPosition: 'center', verticalPosition: 'bottom', panelClass: ['snack-error', 'snack-near-submit'] }
        );
        return;
      }
    }
    const q = (p.quantity || 0) + (increase ? 1 : -1);
    p.quantity = Math.max(0, q);
  }

  submitOrder(): void {
    const orderItems = this.products.filter(p => p.quantity > 0);
    if (orderItems.length === 0) {
      this.snackBar.open('Por favor seleccione al menos un producto', 'Cerrar', { duration: 5000 });
      return;
    }

    const request = {
      StoreId: localStorage.getItem('storeId'), // now set by fetchStoreById if storeId was provided
      OrderDetails: orderItems.map(item => ({
        ProductId: item.id,
        Quantity: item.quantity,
        sku: item.sku
      }))
    };

    this.loading = true;
    const orderId = this.route.snapshot.params['id'];
    const request$ = orderId ? this.orderService.update(orderId, request)
                             : this.orderService.post(request);

    request$.subscribe({
      next: (order) => {
        // Wherever you currently navigate after saving the order:
const nowIso = new Date().toISOString();

// Build items with price (if you have it on each item)
const items = orderItems.map(i => ({
  name: i.name,
  sku: i.sku,
  quantity: i.quantity,
  // try common property names; fallback to 0 if none
  price: i.price ?? i.price ?? 0
}));

// Totals (only matter if you had prices)
const subtotal = items.reduce((acc, it) => acc + it.quantity * (it.price ?? 0), 0);

// If you have a tax toggle/setting, use it; else leave 0
const taxRate = 0.16 // 16% example
const taxAmount = Math.round((subtotal * taxRate + Number.EPSILON) * 100) / 100;
const total = Math.round((subtotal + taxAmount + Number.EPSILON) * 100) / 100;

this.router.navigate(
  ['/order/confirmation', order.id],
  {
    state: {
      storeName: this.storeName,
      storeCode: this.storeCode,

      // Use API timestamps if available; fallback to now
      createdAt: order.createdAt ?? nowIso,
      // Only send updatedAt if this was an edit
      updatedAt: this.isEditMode ? (order.updatedAt ?? nowIso) : undefined,

      items,
      // send totals so the confirmation screen can show Subtotal/Impuestos/Total immediately
      subtotal,
      taxRate,
      total
    }
  }
);
      },
      error: () => this.snackBar.open('Error al guardar pedido', 'Cerrar', { duration: 3000 }),
      complete: () => this.loading = false
    });
  }
}
