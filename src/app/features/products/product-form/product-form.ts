import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.model';
import { Product } from '../../../models/product.model';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  standalone: true,
  selector: 'app-product-form',
  templateUrl: './product-form.html',
  styleUrls: ['./product-form.css'],
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatProgressBarModule
  ]
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(ProductService);
  private categorySvc = inject(CategoryService);
  private snackBar = inject(MatSnackBar);

  id: string | null = null;
  loading = false;
  title = 'Nuevo Producto';

  categories = signal<Category[]>([]);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    sku: ['', [Validators.required, Validators.maxLength(60)]],
    categoryId: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    // load categories for dropdown
    this.categorySvc.getAll().subscribe(cats => this.categories.set(cats));

    this.id = this.route.snapshot.paramMap.get('id');
    if (!this.id) return;

    this.title = 'Editar Producto';
    this.loading = true;
    this.svc.get(this.id).subscribe({
      next: (prod: Product) => {
        this.form.patchValue({
          name: prod.name,
          sku: prod.sku,
          categoryId: prod.categoryId,
          price: prod.price
        });
      },
      complete: () => this.loading = false
    });
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;

    const payload = {
      name: this.form.value.name!.trim(),
      sku: this.form.value.sku!.trim(),
      categoryId: this.form.value.categoryId!,
      price: Number(this.form.value.price)
    };

    const req$ = this.id
      ? this.svc.update(this.id, payload)
      : this.svc.create(payload);

    req$.subscribe({
      next: () => this.router.navigate(['/products']),
      complete: () => {
         this.loading = false;
      },
      error: (err) => {
        this.snackBar.open(`Error al guardar el producto: ${err.message}`, 'Cerrar', { duration: 5000 });         
        console.error(err);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/products']);
  }
}
