import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// import { Store } from '../../services/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { StoreService } from '../../services/store.service';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Store } from '../../models/store.model';
import { CommonModule } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { finalize, map, Observable, retry, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-store-code-entry',
  templateUrl: './store-code-entry.html',
  styleUrl: './store-code-entry.css',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    CommonModule,
    MatOptionModule,
    MatTableModule, // <- enables <table mat-table [dataSource]>
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatAutocompleteModule,
  ],
})
export class StoreCodeEntryComponent implements OnInit {
  storeCode: string = '';
  loading: boolean = false;
    stores: Store[] = [];
  codes: string[] = [];
  names: string[] = [];

  filteredCodes$!: Observable<string[]>;
  filteredNames$!: Observable<string[]>;

  
  form!: FormGroup;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private storeService: StoreService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
   this.form = this.fb.group(
      {
        storeCode: ['', Validators.required],
        storeName: ['', Validators.required],
      },
      { validators: this.storePairValidator(() => this.stores) } // pass getter so it reacts to async load
    );

     // 2) Set up typeahead streams NOW (arrays will update later)
    this.filteredCodes$ = this.form.get('storeCode')!.valueChanges.pipe(
      startWith(''),
      map(v => this.filter(this.codes, v))
    );
    this.filteredNames$ = this.form.get('storeName')!.valueChanges.pipe(
      startWith(''),
      map(v => this.filter(this.names, v))
    );

    this.storeService.warmup().pipe(
  // damos chance a que el API despierte
  switchMap(() => this.storeService.getAll()),
  // si aún está frío, reintenta un par de veces con pequeña espera
  retry({ count: 2, delay: 1200 }),
  finalize(() => this.loading = false)
).subscribe({
  next: (stores) => {
    this.stores = stores ?? [];
    this.codes  = Array.from(new Set(this.stores.map(s => s.code))).sort();
    this.names  = Array.from(new Set(this.stores.map(s => s.name))).sort();
    this.form.updateValueAndValidity({ emitEvent: false });
  },
  error: () => {
    this.snackBar.open('Error al cargar las tiendas', 'Close', { duration: 5000 });
  }
}); 
  }

    private filter(source: string[], val: string | null): string[] {
    const q = (val ?? '').toString().trim().toLowerCase();
    if (!q) return source;
    return source.filter(opt => opt.toLowerCase().includes(q));
  }
  
  onSubmit(): void {
    this.storeCode = this.form.get('storeCode')?.value ?? '';
    if (!this.storeCode) {
      this.snackBar.open('Favor de ingresar un código de tienda', 'Close', { duration: 5000 });
      return;
    }

    this.loading = true;
    this.storeService.getByCodeName(this.storeCode).subscribe({
      next: (store) => {
        this.loading = false;
        if (store) {
          localStorage.removeItem('storeCode');
          localStorage.removeItem('storeId');
          localStorage.removeItem('storeName');
          localStorage.removeItem('storeResponsible');
          localStorage.removeItem('maxQuantity');

          localStorage.setItem('storeCode', this.storeCode);
          localStorage.setItem('storeId', store.id);
          localStorage.setItem('storeName', store.name);
          localStorage.setItem('storeResponsible', store.responsible);
          localStorage.setItem('maxQuantity', store.maxQuantity.toString());

          this.storeService.checkStoreAvailability(store.id).subscribe({
            next: (isAvailable) => {
              if (isAvailable) {
              this.router.navigate(['/order', this.storeCode]);
              } else {
                this.snackBar.open('La tienda no está disponible, ya se ha realizado un pedido para el mes en curso', 'Close', { duration: 3000 });
              }
            },
            error: (x) => {
              this.snackBar.open(
                `Error al verificar la disponibilidad de la tienda: ${x}`,
                'Close',
                { duration: 3000 }
              );
            },
          });
        } else {
          this.snackBar.open('Código de tienda inválido', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Error al validar el código de tienda', 'Close', { duration: 3000 });
      },
      complete: () => {
        this.storeCode = this.form.get('storeCode')?.value ?? '';
      }
    });
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !this.loading && !this.form.invalid) {
      this.onSubmit();
    }
  }
  
  /** Cross-field validator to ensure the selected code+name exists in stores */
  private storePairValidator = (getStores: () => Store[]): ValidatorFn => {
    return (group: AbstractControl) => {
      const code = group.get('storeCode')?.value ?? '';
      const name = group.get('storeName')?.value ?? '';
      if (!code || !name) return null; // let required validators handle empties

      const stores = getStores() || [];
      const match = stores.some(s => s.code === code && s.name === name);
      return match ? null : { pairMismatch: true };
    };
  };
}
