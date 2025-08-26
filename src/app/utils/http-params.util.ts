
// http-params.util.ts
import { HttpParams } from '@angular/common/http';

export function toParams(obj?: Record<string, any>): HttpParams | undefined {
  if (!obj) return undefined;
  let params = new HttpParams();
  Object.entries(obj).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach(v => params = params.append(key, String(v)));
    } else {
      params = params.set(key, String(value));
    }
  });
  return params;
}
