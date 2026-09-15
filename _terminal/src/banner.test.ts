import { describe, expect, it } from 'vitest';
import { bannerPalette, bannerRows, renderBanner } from './banner';

const stripColors = (value: string) => value.replace(/\x1b\[[0-9;]*m/g, '');

describe('welcome banner', () => {
  it('preserves ANSI Shadow and handles narrow terminals without wrapping the art', () => {
    const rows = bannerRows(120);
    const width = Math.max(...rows.map(row => row.length));
    expect(rows).toHaveLength(6);
    expect(bannerRows(width)).toEqual(rows);
    expect(bannerRows(width - 1)).toEqual(['Yingjie Yang']);
  });

  it('adds a gradient without changing the lettering or leaking color into subsequent output', () => {
    for (const columns of [20, 120]) {
      const rendered = renderBanner(columns);
      expect(rendered.map(stripColors)).toEqual(bannerRows(columns));
      for (const row of rendered) {
        expect(row.endsWith('\x1b[0m')).toBe(true);
        const indices = [...row.matchAll(/\x1b\[38;5;(\d+)m/g)].map(match => Number(match[1]));
        expect(indices.length).toBeGreaterThan(1);
        expect(indices.every(index => index >= 16 && index < 48)).toBe(true);
      }
    }
  });

  it('provides theme-aware colors for the gradient', () => {
    const light = bannerPalette('light');
    const dark = bannerPalette('dark');
    expect(light).toHaveLength(32);
    expect(dark).toHaveLength(32);
    expect(light.every(color => /^#[0-9a-f]{6}$/.test(color))).toBe(true);
    expect(dark.every(color => /^#[0-9a-f]{6}$/.test(color))).toBe(true);
    expect(light.every((color, index) => color !== dark[index])).toBe(true);
    expect(light[0]).toBe('#3b6db0');
    expect(light[31]).toBe('#187980');
    expect(dark[0]).toBe('#83aaf2');
    expect(dark[31]).toBe('#75d0c2');
  });
});
