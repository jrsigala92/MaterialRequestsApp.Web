import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Product } from '../models/product.model';
import { API_BASE_URL } from '../utils/api-base-url.token';
import { PaggedRequestQuery } from '../models/querys/pagged-request.query';
import { PagedResult } from '../models/results/paged.result';
import { Observable } from 'rxjs';
import { CategoryDS } from '../models/ds/category.ds';
import { ProductDS } from '../models/ds/product.ds';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  protected resource = 'products'; // <- your API route, e.g. /api/products

constructor(
  protected http: HttpClient,
  @Inject(API_BASE_URL) private baseUrl: string) { }

  // Add any product-specific endpoints here
  getAll() {
    return this.http.get<any[]>(`${this.baseUrl}/${this.resource}`);
  }

  get(id: string) {
    return this.http.get<Product>(`${this.baseUrl}/${this.resource}/${id}`);
  }

  getPage(q: PaggedRequestQuery): Observable<PagedResult<ProductDS>> {
    let params = new HttpParams()
      .set('page', (q.pageIndex + 1).toString()) // si tu backend es 1-based
      .set('pageSize', q.pageSize.toString());
    if (q.sortBy)  params = params.set('sortBy', q.sortBy);
    if (q.sortDir) params = params.set('sortDir', q.sortDir);
    if (q.filter)  params = params.set('filter', q.filter);

    return this.http.get<PagedResult<ProductDS>>(`${this.baseUrl}/${this.resource}/pagged`, { params });
  }
   delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${this.resource}/${id}`);
  }
    create(payload: Omit<Category, 'id'>): Observable<Category> {
      return this.http.post<Category>(`${this.baseUrl}/${this.resource}`, payload);
    }
  
    update(id: string, payload: Omit<Category, 'id'>): Observable<Category> {
      return this.http.put<Category>(`${this.baseUrl}/${this.resource}/${id}`, payload);
    }  
}