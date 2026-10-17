import { describe, it, expect } from 'vitest';
import { indexAtPixel, bandEdges } from '@statslib/chartjs-lib/chart-range-select.js';

// Category scale of 5 bars, 20px each, starting at x = 100 (centers 110, 130, ... 190)
const scale = {
  getValueForPixel: (x) => (x - 110) / 20,
  getPixelForValue: (v) => 110 + v * 20,
};
const area = { left: 100, right: 200, top: 0, bottom: 100 };

describe('range selection helpers', () => {
  it('maps a pixel to the nearest bar, clamped to the axis', () => {
    expect(indexAtPixel(scale, 111, 5)).toBe(0);
    expect(indexAtPixel(scale, 141, 5)).toBe(2);
    expect(indexAtPixel(scale, 20, 5)).toBe(0);
    expect(indexAtPixel(scale, 400, 5)).toBe(4);
    expect(indexAtPixel(scale, 150, 0)).toBe(-1);
  });

  it('covers the whole band of the selected bars', () => {
    expect(bandEdges(scale, area, 1, 2, 5)).toEqual({ left: 120, right: 160 });
    expect(bandEdges(scale, area, 0, 4, 5)).toEqual({ left: 100, right: 200 });
  });
});
