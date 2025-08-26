// base.service.ts
import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { API_BASE_URL } from '../utils/api-base-url.token';
import { toParams } from '../utils/http-params.util';


export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export abstract class BaseService<T, K = number> {
  /** Child classes just set resource = 'products' | 'orders' | ... */
  protected abstract resource: string;

  constructor(
    protected http: HttpClient,
    @Inject(API_BASE_URL) private baseUrl: string
  ) {}

  protected url(...parts: (string | number)[]) {
    const joined = [this.baseUrl.replace(/\/$/, ''), this.resource, ...parts].join('/');
    return joined.replace(/([^:]\/)\/+/g, '$1'); // collapse accidental double slashes (except after http:)
  }

  list(query?: Record<string, any>): Observable<T[]> {
    return this.http.get<T[]>(this.url(), { params: toParams(query) })
      .pipe(retry(1), catchError(this.handleError));
  }

  page(query?: { page?: number; pageSize?: number } & Record<string, any>): Observable<Page<T>> {
    return this.http.get<Page<T>>(this.url('page'), { params: toParams(query) })
      .pipe(retry(1), catchError(this.handleError));
  }

  get(id: K): Observable<T> {
    return this.http.get<T>(this.url(id as any))
      .pipe(retry(1), catchError(this.handleError));
  }

  create(dto: Partial<T>): Observable<T> {
    return this.http.post<T>(this.url(), dto)
      .pipe(catchError(this.handleError));
  }

  update(id: K, dto: Partial<T>): Observable<T> {
    return this.http.put<T>(this.url(id as any), dto)
      .pipe(catchError(this.handleError));
  }

  patch(id: K, dto: Partial<T>): Observable<T> {
    return this.http.patch<T>(this.url(id as any), dto)
      .pipe(catchError(this.handleError));
  }

  delete(id: K): Observable<void> {
    return this.http.delete<void>(this.url(id as any))
      .pipe(catchError(this.handleError));
  }

  search(q: string, extra?: Record<string, any>): Observable<T[]> {
    const params = toParams({ q, ...extra });
    return this.http.get<T[]>(this.url('search'), { params })
      .pipe(retry(1), catchError(this.handleError));
  }

  /** Centralized error handling */
  protected handleError(err: HttpErrorResponse) {
    // You can enhance this to extract server messages or map error codes
    return throwError(() => err);
  }
}
