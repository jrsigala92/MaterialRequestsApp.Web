import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
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
import { Router, RouterLink } from '@angular/router';
import { Subject, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, switchMap, takeUntil, finalize } from 'rxjs/operators';

import { OrderService} from '../../services/order.service';
import { OrderDS } from '../../models/ds/order.ds';
import { PagedResult } from '../../models/results/paged.result';
import { PaggedRequestQuery } from '../../models/querys/pagged-request.query';

@Component({
  selector: 'app-order-list',
  standalone: true,
  templateUrl: './order-list.html',
  styleUrls: ['./order-list.css'],
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
    RouterLink
  ]
})
export class OrderList implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = [ 'storeName', 'createdAt', 'subTotal','total', 'actions'];
  dataSource = new MatTableDataSource<OrderDS>([]);
  total = 0;
  loading = false;
  deletingId: string | null = null;

  filterCtl = new FormControl<string>('', { nonNullable: true });

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();

  constructor(private orderService: OrderService, private router: Router) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Reset to first page on sort or filter changes
    this.sort.sortChange.pipe(takeUntil(this.destroy$)).subscribe(() => this.paginator.firstPage());
    this.filterCtl.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.paginator.firstPage());

    // React to sort, page, and filter -> call API
    merge(
      this.sort.sortChange,
      this.paginator.page,
      this.filterCtl.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
    )
    .pipe(
      startWith({}), // initial load
      switchMap(() => {
        this.loading = true;
        const q: PaggedRequestQuery = {
          pageIndex: this.paginator?.pageIndex ?? 0,
          pageSize: this.paginator?.pageSize ?? 25,
          sortBy: this.sort?.active || 'createdAt',
          sortDir: (this.sort?.direction as 'asc' | 'desc') || 'desc',
          filter: this.filterCtl.value.trim()
        };
        return this.orderService.getPage(q).pipe(finalize(() => (this.loading = false)));
      }),
      takeUntil(this.destroy$)
    )
    .subscribe({
      next: (res: PagedResult<OrderDS>) => {
        this.dataSource.data = res.items ?? [];
        this.total = res.total ?? 0;
      },
      error: () => {
        this.dataSource.data = [];
        this.total = 0;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onEdit(row: OrderDS): void {
    console.log(`Editing order: ${row.id}`);
    this.router.navigate([`/order/edit/${row.storeId}/${row.id}`]); // ajusta tu ruta
  }

  onDelete(row: OrderDS): void {
    if (!confirm(`¿Eliminar la orden ${row.id}?`)) return;
    this.deletingId = row.id;
    this.orderService.delete(row.id)
      .pipe(finalize(() => (this.deletingId = null)))
      .subscribe({
        next: () => {
          // Vuelve a cargar la página actual
          this.paginator._changePageSize(this.paginator.pageSize);
        },
        error: () => alert('No se pudo eliminar la orden.')
      });
  }
}
