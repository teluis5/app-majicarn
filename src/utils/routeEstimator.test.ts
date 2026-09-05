import { describe, it, expect } from 'vitest';
import {
  calculateHubenyDistance,
  estimateHighwayToll,
  findNearestInterchange,
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

  it('finds nearest interchange accurately', () => {
    // 箱根近郊 (35.23, 139.10) -> 箱根口IC or 小田原西IC
    const ic = findNearestInterchange(35.2333, 139.1039, 20);
    expect(ic).not.toBeNull();
    expect(ic?.name).toContain('IC');

    // 富士河口湖近郊 -> 河口湖IC or 富士吉田IC
    const fujiIC = findNearestInterchange(35.4975, 138.7686, 20);
    expect(fujiIC).not.toBeNull();
    expect(fujiIC?.name).toMatch(/(河口湖|富士吉田)/);
  });

  it('incorporates IC-to-IC actual distance into toll breakdown', () => {
    const mockRouteResult = {
      oneWayDistanceKm: 85,
      totalDistanceKm: 170,
      oneWayToll: 1900,
      totalToll: 3800,
      isRoundTrip: true,
      useHighway: true,
      fromName: '東京駅',
      toName: '箱根湯本',
      isFallback: false,
      fromCoords: { lat: 35.6812, lon: 139.7671 },
      toCoords: { lat: 35.2333, lon: 139.1039 },
      routeCoordinates: [] as [number, number][],
      googleMapsUrl: '',
      entryICName: '東京IC',
      exitICName: '箱根口IC',
      highwayDistanceKm: 68,
      highwayRoadNames: ['東名高速道路', '小田原厚木道路'],
    };

    const breakdown = getHighwayTollBreakdown(170, true, 'sedan_suv', undefined, mockRouteResult);
    expect(breakdown.entryICName).toBe('東京IC');
    expect(breakdown.exitICName).toBe('箱根口IC');
    expect(breakdown.highwayKm).toBe(68);
    expect(breakdown.highwayRoadNames).toContain('東名高速道路');
    expect(breakdown.formulaDescription).toContain('IC間実走行68km');
  });
});
