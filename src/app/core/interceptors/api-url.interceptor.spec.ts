import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiUrlInterceptor } from './api-url.interceptor';
import { environment } from '@environments/environment';

describe('apiUrlInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should prepend base URL to request', () => {
    http.get('board').subscribe();

    const req = httpMock.expectOne(`${environment.baseURL}/board`);
    expect(req.request.url).toBe(`${environment.baseURL}/board`);
    req.flush({});
  });

  it('should add Authorization header', () => {
    http.get('board').subscribe();

    const req = httpMock.expectOne(`${environment.baseURL}/board`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer 123');
    req.flush({});
  });
});
