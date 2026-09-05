import { describe, it, expect } from 'vitest';
import {
  calculateHubenyDistance,
  estimateHighwayToll,
  getHighwayTollBreakdown,
  PRESET_LOCATIONS,
} from './routeEstimator';

describe('Route Estimator', () => {
  it('calculates Hubeny straight line distance correctly', () => {
    // 東京駅 ➔ 横浜駅: 直線で約28〜30km
    const tokyo = PRESET_LOCATIONS.tokyo;
    const yokohama = PRESET_LOCATIONS.yokohama;
    const dist = calculateHubenyDistance(tokyo.lat, tokyo.lon, yokohama.lat, yokohama.lon);
    expect(dist).toBeGreaterThan(25);
    expect(dist).toBeLessThan(35);
  });

  it('estimates highway toll properly based on distance', () => {
    // 100km の高速利用
    const toll = estimateHighwayToll(100, 'sedan_suv');
    // NEXCO目安: (88km * 24.6 + 150) * 1.1 ≒ 2546円 ➔ 100円丸めで 2500円前後
    expect(toll).toBeGreaterThan(2000);
    expect(toll).toBeLessThan(3200);

    // 軽自動車割引
    const keiToll = estimateHighwayToll(100, 'kei');
    expect(keiToll).toBeLessThan(toll);
  });

  it('generates highway toll breakdown details accurately', () => {
    const breakdown = getHighwayTollBreakdown(200, true, 'sedan_suv');
    expect(breakdown.isRoundTrip).toBe(true);
    expect(breakdown.estimatedToll).toBeGreaterThan(0);
    expect(breakdown.oneWayToll).toBeGreaterThan(0);
    expect(breakdown.isKeiDiscountApplied).toBe(false);
    expect(breakdown.discountEstimateLateNight).toBeGreaterThan(0);

    const keiBreakdown = getHighwayTollBreakdown(200, true, 'kei');
    expect(keiBreakdown.isKeiDiscountApplied).toBe(true);
    expect(keiBreakdown.estimatedToll).toBeLessThan(breakdown.estimatedToll);
  });
});
