import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export const apiUrlInterceptor = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  request = request.clone({
    url: `${environment.baseURL}/${request.url}`,
    headers: request.headers.set('Authorization', `Bearer 123`),
  });
  return next(request);
};
