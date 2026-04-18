import { ConfirmService } from './confirm.service';

describe('ConfirmService', () => {
  let service: ConfirmService;

  beforeEach(() => {
    service = new ConfirmService();
  });

  it('should start with null state', () => {
    expect(service.state()).toBeNull();
  });

  it('should set state when confirm is called', () => {
    service.confirm('Are you sure?');
    expect(service.state()).not.toBeNull();
    expect(service.state()!.message).toBe('Are you sure?');
  });

  it('should resolve true on accept', async () => {
    const promise = service.confirm('Delete?');
    service.accept();

    const result = await promise;
    expect(result).toBe(true);
    expect(service.state()).toBeNull();
  });

  it('should resolve false on cancel', async () => {
    const promise = service.confirm('Delete?');
    service.cancel();

    const result = await promise;
    expect(result).toBe(false);
    expect(service.state()).toBeNull();
  });

  it('should resolve previous confirm as false when a new one is called', async () => {
    const first = service.confirm('First?');
    const second = service.confirm('Second?');

    const firstResult = await first;
    expect(firstResult).toBe(false);

    service.accept();
    const secondResult = await second;
    expect(secondResult).toBe(true);
  });
});
