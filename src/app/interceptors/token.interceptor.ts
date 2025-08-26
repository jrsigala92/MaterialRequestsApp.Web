import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const raw = localStorage.getItem('auth');
  let token: string | null = null;
  try { token = raw ? (JSON.parse(raw).token as string) : null; } catch {}

  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
