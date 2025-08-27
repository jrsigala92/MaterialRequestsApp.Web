import { Inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Product } from '../models/product.model';
import { API_BASE_URL } from '../utils/api-base-url.token';
import { Order } from '../models/order.model';
import { Store } from '../models/store.model';
import { PaggedRequestQuery } from '../models/querys/pagged-request.query';
import { PagedResult } from '../models/results/paged.result';
import { StoreDS } from '../models/ds/store.ds';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StoreService {
  protected resource = 'stores'; // <- your API route, e.g. /api/stores

  constructor(protected http: HttpClient, @Inject(API_BASE_URL) private baseUrl: string) {}

  // Add any product-specific endpoints here
  getAll() {
    return this.http.get<Store[]>(`${this.baseUrl}/${this.resource}`);
  }
warmup(): Observable<any> {
  return this.http.get(`${this.baseUrl}/${this.resource}/health`, { responseType: 'text' });
}
  get(id: string) {
    return this.http.get<Store>(`${this.baseUrl}/${this.resource}/${id}`);
  }

  getPage(q: PaggedRequestQuery): Observable<PagedResult<StoreDS>> {
    let params = new HttpParams()
      .set('page', (q.pageIndex + 1).toString()) // si tu backend es 1-based
      .set('pageSize', q.pageSize.toString());
    if (q.sortBy) params = params.set('sortBy', q.sortBy);
    if (q.sortDir) params = params.set('sortDir', q.sortDir);
    if (q.filter) params = params.set('filter', q.filter);

    return this.http.get<PagedResult<StoreDS>>(`${this.baseUrl}/${this.resource}/pagged`, {
      params,
    });
  }

  getByCodeName(code: string) {
    return this.http.get<Store>(`${this.baseUrl}/${this.resource}/by-code/${code}`);
  }

  checkStoreAvailability(id: string) {
    return this.http.get<Store>(`${this.baseUrl}/${this.resource}/check-store-availability/${id}`);
  }

  post(request: any) {
    return this.http.post<Store>(`${this.baseUrl}/${this.resource}`, request);
  }

  update(id: string, payload: Omit<Store, 'id'>): Observable<Store> {
    return this.http.put<Store>(`${this.baseUrl}/${this.resource}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${this.resource}/${id}`);
  }
}