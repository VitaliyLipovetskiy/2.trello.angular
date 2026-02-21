import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { inject } from '@angular/core';
import { LoaderService } from '@app/home/services/loader.service';

export const progressBarInterceptor = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const loaderService = inject(LoaderService);
  loaderService.show();
  return next(request).pipe(finalize(() => loaderService.hide()));
};
