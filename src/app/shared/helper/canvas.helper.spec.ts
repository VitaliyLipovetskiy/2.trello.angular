import { drawRoundedRect } from './canvas.helper';

describe('drawRoundedRect', () => {
  it('should call all path methods in correct order', () => {
    const ctx = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      closePath: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    drawRoundedRect(ctx, 0, 0, 100, 50, 5);

    expect(ctx.beginPath).toHaveBeenCalledTimes(1);
    expect(ctx.closePath).toHaveBeenCalledTimes(1);
    expect(ctx.moveTo).toHaveBeenCalledTimes(1);
    expect(ctx.lineTo).toHaveBeenCalledTimes(4);
    expect(ctx.quadraticCurveTo).toHaveBeenCalledTimes(4);
  });

  it('should use correct start position (x + r, y)', () => {
    const ctx = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      closePath: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    drawRoundedRect(ctx, 10, 20, 100, 50, 8);

    expect(ctx.moveTo).toHaveBeenCalledWith(18, 20);
  });

  it('should draw correct top-right corner', () => {
    const ctx = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      closePath: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    drawRoundedRect(ctx, 0, 0, 100, 50, 10);

    // First lineTo: top edge → (x + w - r, y) = (90, 0)
    expect(ctx.lineTo).toHaveBeenNthCalledWith(1, 90, 0);
    // First quadraticCurveTo: top-right corner
    expect(ctx.quadraticCurveTo).toHaveBeenNthCalledWith(1, 100, 0, 100, 10);
  });
});
