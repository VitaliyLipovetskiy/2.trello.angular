import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { progressBarInterceptor } from './progress-bar.interceptor';
import { LoaderService } from '@app/core/services/loader.service';

describe('progressBarInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let loaderService: LoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([progressBarInterceptor])),
        provideHttpClientTesting(),
        LoaderService,
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    loaderService = TestBed.inject(LoaderService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should show loader on request start', () => {
    http.get('/test').subscribe();
    expect(loaderService.isLoading()).toBe(true);

    httpMock.expectOne('/test').flush({});
  });

  it('should hide loader after request completes', () => {
    http.get('/test').subscribe();

    const req = httpMock.expectOne('/test');
    req.flush({});

    expect(loaderService.isLoading()).toBe(false);
  });

  it('should hide loader after request error', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    http.get('/test').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/test');
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(loaderService.isLoading()).toBe(false);
  });
});
