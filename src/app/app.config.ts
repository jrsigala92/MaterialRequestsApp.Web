import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { API_BASE_URL } from './utils/api-base-url.token';
import { tokenInterceptor } from './interceptors/token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),  
    provideHttpClient(withInterceptors([tokenInterceptor])),
    { provide: API_BASE_URL, useValue: 'https://csigala-002-site1.rtempurl.com/api' },
    // { provide: API_BASE_URL, useValue: 'https://localhost:7109/api' },
    provideAnimations()  
  ]
};
