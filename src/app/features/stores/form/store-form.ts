import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { StoreService } from '../../../services/store.service';
import { Store } from '../../../models/store.model';

@Component({
  selector: 'app-store-form',
  templateUrl: './store-form.html',
  styleUrls: ['./store-form.css'],
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
})
export class StoreFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(StoreService);
  private snack = inject(MatSnackBar);

  id: string | null = null;
  loading = false;
  title = 'Nueva Tienda';

  form = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(20)]],
    name: ['', [Validators.required, Validators.maxLength(150)]],
    responsible: ['', [Validators.maxLength(150)]],
    city: ['', [Validators.maxLength(150)]],
    maxQuantity: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (!this.id) return;

    this.title = 'Editar Tienda';
    this.loading = true;
    this.svc.get(this.id).subscribe({
      next: (s: Store) =>
        this.form.patchValue({
          code: s.code,
          name: s.name,
          responsible: s.responsible,
          city: s.city,
          maxQuantity: s.maxQuantity,
        }),
      complete: () => (this.loading = false),
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const payload = {
      code: this.form.value.code!.trim(),
      name: this.form.value.name!.trim(),
      city: (this.form.value.city ?? '').toString().trim(),
      responsible: (this.form.value.responsible ?? '').toString().trim(),
      maxQuantity: Number(this.form.value.maxQuantity ?? 0),
    };

    const req$ = this.id ? this.svc.update(this.id, payload) : this.svc.post(payload);

    req$.subscribe({
      next: () => {
        this.snack.open(this.id ? 'Tienda actualizada' : 'Tienda creada', 'OK', { duration: 2000 });
        this.router.navigate(['/stores']);
      },
      complete: () => (this.loading = false),
    });
  }

  cancel(): void {
    this.router.navigate(['/stores']);
  }
}
