import { Component, OnInit, ViewChild, inject, computed, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { Product } from '../../../models/product.model';
import { Category } from '../../../models/category.model';
import { PaggedRequestQuery } from '../../../models/querys/pagged-request.query';


@Component({
  standalone: true,
  selector: 'app-product-list',
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
})
export class ProductListComponent implements OnInit, AfterViewInit {
  
  ngAfterViewInit(): void {
        this.sort.sortChange.pipe(debounceTime(250)).subscribe(() => {
      console.log('sort changed');
      if (this.paginator) this.paginator.firstPage();
      this.load();
    });
  }

  private svc = inject(ProductService);
  private categorySvc = inject(CategoryService);
  private router = inject(Router);

  displayedColumns = ['name', 'sku', 'category', 'price', 'actions'];
  dataSource = new MatTableDataSource<Product>([]);

  total = 0;
  loading = false;

  filterCtl = new FormControl<string>('', { nonNullable: true });
  pageSize = 10;

  categories = signal<Category[]>([]);
  categoryName = computed(() => {
    const map = new Map(this.categories().map((c) => [c.id, c.name]));
    return (id?: string) => (id ? map.get(id) ?? id : '');
  });

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    // preload categories for the "category" column
    this.categorySvc.getAll().subscribe((cats) => this.categories.set(cats));

    this.load();

    this.filterCtl.valueChanges.pipe(debounceTime(250)).subscribe(() => {
      if (this.paginator) this.paginator.firstPage();
      this.load();
    });


  }

  
  load(): void {
    this.loading = true;
    const page = this.paginator ? this.paginator.pageIndex : 0;
    const pageSize = this.paginator ? this.paginator.pageSize : this.pageSize;
    const q: PaggedRequestQuery = {
      pageIndex: page,
      pageSize: pageSize,
      filter: this.filterCtl.value || '',
      sortBy: this.sort?.active || 'createdAt',
      sortDir: (this.sort?.direction as 'asc' | 'desc') || 'desc',
    };
    this.svc.getPage(q).subscribe({
      next: (res) => {
        this.dataSource.data = res.items;
        this.total = res.total;
      },
      complete: () => (this.loading = false),
    });
  }

  onAdd(): void {
    console.log('navigating to new product');
    this.router.navigate(['/products/new']);
  }

  onEdit(row: Product): void {
    this.router.navigate(['/products', row.id, 'edit']);
  }

  onDelete(row: Product): void {
    if (!confirm(`¿Eliminar producto "${row.name}"?`)) return;
    this.svc.delete(row.id).subscribe(() => this.load());
  }

  onPageChange() {
    this.load();
  }
}