import { LoaderService } from './loader.service';

describe('LoaderService', () => {
  let service: LoaderService;

  beforeEach(() => {
    service = new LoaderService();
  });

  it('should start with isLoading false', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('should be loading after show()', () => {
    service.show();
    expect(service.isLoading()).toBe(true);
  });

  it('should stop loading after show() then hide()', () => {
    service.show();
    service.hide();
    expect(service.isLoading()).toBe(false);
  });

  it('should track multiple concurrent requests', () => {
    service.show();
    service.show();
    expect(service.isLoading()).toBe(true);

    service.hide();
    expect(service.isLoading()).toBe(true);

    service.hide();
    expect(service.isLoading()).toBe(false);
  });

  it('should not go below zero', () => {
    service.hide();
    service.hide();
    expect(service.isLoading()).toBe(false);

    service.show();
    expect(service.isLoading()).toBe(true);
  });
});
