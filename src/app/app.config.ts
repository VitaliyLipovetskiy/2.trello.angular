import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { apiUrlInterceptor } from './helpers/api-url.interceptor';
import { provideToastr } from 'ngx-toastr';
import { progressBarInterceptor } from '@app/helpers/progress-bar.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([apiUrlInterceptor, progressBarInterceptor])),
    provideToastr(),
  ],
};
