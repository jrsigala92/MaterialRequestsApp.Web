import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Product } from '../models/product.model';
import { API_BASE_URL } from '../utils/api-base-url.token';
import { Order } from '../models/order.model';
import { Observable } from 'rxjs';
import { OrderDS } from '../models/ds/order.ds';
import { PagedResult } from '../models/results/paged.result';
import { PaggedRequestQuery } from '../models/querys/pagged-request.query';

@Injectable({ providedIn: 'root' })
export class OrderService {
  protected resource = 'orders'; // <- your API route, e.g. /api/orders

  constructor(protected http: HttpClient, @Inject(API_BASE_URL) private baseUrl: string) {}

  // Add any product-specific endpoints here
  getAll() {
    return this.http.get<any[]>(`${this.baseUrl}/${this.resource}`);
  }

  get(id: string) {
    return this.http.get<Order>(`${this.baseUrl}/${this.resource}/${id}`);
  }

  post(request: any) {
    return this.http.post<any>(`${this.baseUrl}/${this.resource}`, request);
  }
  update(id: string, payload: any) {
    return this.http.put(`${this.baseUrl}/${this.resource}/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${this.resource}/${id}`);
  }
  getPage(q: PaggedRequestQuery): Observable<PagedResult<OrderDS>> {
    let params = new HttpParams()
      .set('page', (q.pageIndex + 1).toString()) // si tu backend es 1-based
      .set('pageSize', q.pageSize.toString());
    if (q.sortBy) params = params.set('sortBy', q.sortBy);
    if (q.sortDir) params = params.set('sortDir', q.sortDir);
    if (q.filter) params = params.set('filter', q.filter);

    return this.http.get<PagedResult<OrderDS>>(`${this.baseUrl}/${this.resource}/pagged`, {
      params,
    });
  }
}