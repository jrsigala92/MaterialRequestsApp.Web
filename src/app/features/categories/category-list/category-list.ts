import { Component, OnInit, inject, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { debounceTime, tap } from 'rxjs';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.model';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PaggedRequestQuery } from '../../../models/querys/pagged-request.query';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.html',
  styleUrls: ['./category-list.css'],
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
export class CategoryListComponent implements OnInit, AfterViewInit {
  private svc = inject(CategoryService);
  private router = inject(Router);

  displayedColumns = ['name', 'actions'];
  dataSource = new MatTableDataSource<Category>([]);
  total = 0;
  loading = false;

  filterCtl = new FormControl<string>('', { nonNullable: true });
  pageSize = 10;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.load();

    this.filterCtl.valueChanges
      .pipe(
        debounceTime(250),
        tap(() => {
          if (this.paginator) this.paginator.firstPage();
          this.load();
        })
      )
      .subscribe();

      this.sort.sortChange.pipe(debounceTime(250)).subscribe(() => {
        if (this.paginator) this.paginator.firstPage();
        this.load();
      });
  }

  ngAfterViewInit(): void {
        this.sort.sortChange.pipe(debounceTime(250)).subscribe(() => {
      console.log('sort changed');
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
        setTimeout(() => {
          if (this.sort) this.dataSource.sort = this.sort;
        });
      },
      complete: () => (this.loading = false),
    });
  }

  onAdd(): void {
    this.router.navigate(['/categories/new']);
  }

  onEdit(row: Category): void {
    this.router.navigate(['/categories', row.id, 'edit']);
  }

  onDelete(row: Category): void {
    if (!confirm(`¿Eliminar categoría "${row.name}"?`)) return;
    this.svc.delete(row.id).subscribe(() => this.load());
  }

  onPageChange() {
    this.load();
  }
}
