import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { switchMap, of } from 'rxjs';
import { Category } from '../../../models/category.model';
import { CategoryService } from '../../../services/category.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.html',
  styleUrls: ['./category-form.css'],
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
export class CategoryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(CategoryService);

  id: string | null = null;
  loading = false;
  title = 'Nueva Categoría';

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
  });

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (!this.id) return;

    this.title = 'Editar Categoría';
    this.loading = true;
    this.svc.getById(this.id).subscribe({
      next: (cat: Category) => this.form.patchValue({ name: cat.name }),
      complete: () => (this.loading = false),
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const payload = { name: this.form.value.name!.trim() };

    const req$ = this.id ? this.svc.update(this.id, payload) : this.svc.create(payload);

    req$.subscribe({
      next: () => this.router.navigate(['/categories']),
      complete: () => (this.loading = false),
    });
  }

  cancel(): void {
    this.router.navigate(['/categories']);
  }
}
