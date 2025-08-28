import { Component, OnInit, ViewChild, inject, AfterViewInit } from '@angular/core';
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
import { debounceTime, map, Observable, shareReplay } from 'rxjs';
import { StoreService } from '../../../services/store.service';
import { Store } from '../../../models/store.model';
import { PaggedRequestQuery } from '../../../models/querys/pagged-request.query';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatCardModule } from '@angular/material/card';



@Component({
  standalone: true,
  selector: 'app-store-list',
  templateUrl: './store-list.html',
  styleUrls: ['./store-list.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
})
export class StoreListComponent implements OnInit, AfterViewInit {
    isHandset$: Observable<boolean>;

  private svc = inject(StoreService);
  private router = inject(Router);
 constructor(private bp: BreakpointObserver) {
    this.isHandset$ = this.bp.observe(Breakpoints.Handset)
      .pipe(map(r => r.matches), shareReplay(1));
  }
  displayedColumns = ['code', 'name', 'responsible', 'city' ,'maxQuantity', 'actions'];
  dataSource = new MatTableDataSource<Store>([]);

  total = 0;
  loading = false;

  filterCtl = new FormControl<string>('', { nonNullable: true });
  pageSize = 10;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.load();

    this.filterCtl.valueChanges.pipe(debounceTime(250)).subscribe(() => {
      if (this.paginator) this.paginator.firstPage();
      this.load();
    });
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.pipe(debounceTime(250)).subscribe(() => {
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
      // default sort if none selected
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
    this.router.navigate(['/stores/new']);
  }

  onEdit(row: Store): void {
    this.router.navigate(['/stores', row.id, 'edit']);
  }

  onDelete(row: Store): void {
    if (!confirm(`¿Eliminar tienda "${row.name}"?`)) return;
    this.svc.delete(row.id).subscribe(() => this.load());
  }

  onPageChange(): void {
    this.load();
  }
}
