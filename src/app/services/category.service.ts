import { Inject, Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';
import { API_BASE_URL } from '../utils/api-base-url.token';
import { PagedResult } from '../models/results/paged.result';
import { PaggedRequestQuery } from '../models/querys/pagged-request.query';
import { OrderDS } from '../models/ds/order.ds';
import { CategoryDS } from '../models/ds/category.ds';

// adjust to your API base
const BASE_URL = '/api/categories';

@Injectable({ providedIn: 'root' })

export class CategoryService {
  constructor(
    @Inject(API_BASE_URL) private baseUrl: string
  ) { }

  protected resource = 'categories'; // <- your API route, e.g. /api/categories

  private http = inject(HttpClient);

  getAll(){
    return this.http.get<Category[]>(`${this.baseUrl}/${this.resource}`);
  }

  getById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${this.resource}/${id}`);
  }

  getPage(q: PaggedRequestQuery): Observable<PagedResult<CategoryDS>> {
    let params = new HttpParams()
      .set('page', (q.pageIndex + 1).toString()) // si tu backend es 1-based
      .set('pageSize', q.pageSize.toString());
    if (q.sortBy)  params = params.set('sortBy', q.sortBy);
    if (q.sortDir) params = params.set('sortDir', q.sortDir);
    if (q.filter)  params = params.set('filter', q.filter);

    return this.http.get<PagedResult<CategoryDS>>(`${this.baseUrl}/${this.resource}/pagged`, { params });
  }
  
  create(payload: Omit<Category, 'id'>): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/${this.resource}`, payload);
  }

  update(id: string, payload: Omit<Category, 'id'>): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${this.resource}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${this.resource}/${id}`);
  }
}
