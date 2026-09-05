import type { CarTypePreset } from '../types/calculator';

// 代表的な主要都市・観光スポットの内蔵座標辞書（オフライン/フォールバック用）
export const PRESET_LOCATIONS: Record<string, { lat: number; lon: number; name: string }> = {
  tokyo: { name: '東京駅', lat: 35.6812, lon: 139.7671 },
  shinjuku: { name: '新宿駅', lat: 35.6909, lon: 139.7003 },
  shibuya: { name: '渋谷駅', lat: 35.6580, lon: 139.7016 },
  yokohama: { name: '横浜駅', lat: 35.4658, lon: 139.6227 },
  omiya: { name: '大宮駅', lat: 35.9063, lon: 139.6240 },
  chiba: { name: '千葉駅', lat: 35.6131, lon: 140.1134 },
  nagoya: { name: '名古屋駅', lat: 35.1709, lon: 136.8815 },
  osaka: { name: '大阪駅', lat: 34.7025, lon: 135.4959 },
  kyoto: { name: '京都駅', lat: 34.9858, lon: 135.7588 },
  kobe: { name: '三宮駅 (神戸)', lat: 34.6946, lon: 135.1955 },
  hakone: { name: '箱根湯本', lat: 35.2333, lon: 139.1039 },
  fuji: { name: '富士河口湖', lat: 35.4975, lon: 138.7686 },
  karuizawa: { name: '軽井沢', lat: 36.3486, lon: 138.6358 },
  nikko: { name: '日光東照宮', lat: 36.7581, lon: 139.5989 },
  atami: { name: '熱海温泉', lat: 35.0963, lon: 139.0716 },
  kusatsu: { name: '草津温泉', lat: 36.6206, lon: 138.5962 },
  kamakura: { name: '鎌倉', lat: 35.3190, lon: 139.5504 },
  awaji: { name: '淡路島 (淡路SA)', lat: 34.5878, lon: 135.0189 },
  ise: { name: '伊勢神宮', lat: 34.4550, lon: 136.7258 },
};

// 人気の定番ドライブルート
export const POPULAR_ROUTES = [
  { from: '新宿駅', to: '箱根湯本', label: '東京 ⇔ 箱根' },
  { from: '東京駅', to: '富士河口湖', label: '東京 ⇔ 富士五湖' },
  { from: '東京駅', to: '日光東照宮', label: '東京 ⇔ 日光' },
  { from: '東京駅', to: '軽井沢', label: '東京 ⇔ 軽井沢' },
  { from: '横浜駅', to: '熱海温泉', label: '横浜 ⇔ 熱海' },
  { from: '大阪駅', to: '淡路島 (淡路SA)', label: '大阪 ⇔ 淡路島' },
  { from: '名古屋駅', to: '伊勢神宮', label: '名古屋 ⇔ 伊勢' },
];

/**
 * 2地点の緯度経度からヒュベニの公式による直線距離(km)を計算
 */
export function calculateHubenyDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const a = 6378137.0; // 赤道半径
  const b = 6356752.314245; // 極半径
  const e2 = (a * a - b * b) / (a * a);

  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const avgLat = rad((lat1 + lat2) / 2);

  const w = Math.sqrt(1 - e2 * Math.sin(avgLat) * Math.sin(avgLat));
  const m = (a * (1 - e2)) / Math.pow(w, 3);
  const n = a / w;

  const distM = Math.sqrt(
    Math.pow(dLat * m, 2) + Math.pow(dLon * n * Math.cos(avgLat), 2)
  );

  return distM / 1000;
}

/**
 * 地名から緯度経度を取得（Nominatim API + 内蔵プリセット）
 */
export async function geocodePlace(query: string): Promise<{ lat: number; lon: number; name: string } | null> {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  // 1. 内蔵プリセットの検索
  for (const key of Object.keys(PRESET_LOCATIONS)) {
    const loc = PRESET_LOCATIONS[key];
    if (loc.name.toLowerCase().includes(q) || q.includes(loc.name.toLowerCase()) || key === q) {
      return loc;
    }
  }

  // 2. OpenStreetMap Nominatim ジオコーディングAPI
  try {
    const encoded = encodeURIComponent(query);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&countrycodes=jp&limit=1`,
      {
        headers: {
          'Accept-Language': 'ja',
        },
      }
    );
    if (!res.ok) throw new Error('Geocoding failed');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        name: data[0].display_name.split(',')[0],
      };
    }
  } catch (e) {
    console.warn('Geocoding API error, using fallback', e);
  }

  return null;
}

export interface RouteEstimateResult {
  oneWayDistanceKm: number;
  totalDistanceKm: number;
  oneWayToll: number;
  totalToll: number;
  isRoundTrip: boolean;
  useHighway: boolean;
  fromName: string;
  toName: string;
  isFallback: boolean;
  fromCoords: { lat: number; lon: number };
  toCoords: { lat: number; lon: number };
  routeCoordinates: [number, number][]; // [lat, lon][] for Leaflet
  googleMapsUrl: string;
}

export interface HighwayTollBreakdown {
  estimatedToll: number; // 推定高速代合計
  oneWayToll: number; // 片道高速代
  isRoundTrip: boolean; // 往復かどうか
  highwayKm: number; // 高速推定走行距離 (片道)
  carTypeName: string; // 適用車種名 (普通車・軽自動車等)
  isKeiDiscountApplied: boolean; // 軽自動車割引適用有無
  discountEstimateLateNight: number; // 深夜割引目安 (30%OFF)
  discountEstimateHoliday: number; // 休日割引目安 (30%OFF)
  formulaDescription: string; // 計算式の解説
}

/**
 * 高速代の内訳詳細情報を取得
 */
export function getHighwayTollBreakdown(
  totalRoadDistanceKm: number,
  isRoundTrip: boolean,
  carType: CarTypePreset = 'sedan_suv',
  currentToll?: number
): HighwayTollBreakdown {
  const oneWayDistanceKm = isRoundTrip ? Math.round((totalRoadDistanceKm / 2) * 10) / 10 : totalRoadDistanceKm;
  const oneWayToll = estimateHighwayToll(oneWayDistanceKm, carType);
  const estimatedTotal = oneWayToll * (isRoundTrip ? 2 : 1);
  const activeToll = currentToll !== undefined && currentToll > 0 ? currentToll : estimatedTotal;

  const highwayKm = Math.max(0, Math.round(oneWayDistanceKm - 12));
  const isKei = carType === 'kei';
  const carTypeName = isKei ? '軽自動車（約20%割引区分）' : '普通車・SUV・ミニバン（標準区分）';

  // ETC深夜・休日割引（約30%割引）
  const discountEstimateLateNight = Math.round((activeToll * 0.7) / 100) * 100;
  const discountEstimateHoliday = Math.round((activeToll * 0.7) / 100) * 100;

  let formulaDescription = 'NEXCO標準: (高速区間km × 24.6円 + 150円) × 1.10';
  if (isKei) {
    formulaDescription += ' × 軽自動車割引0.8';
  }

  return {
    estimatedToll: activeToll,
    oneWayToll,
    isRoundTrip,
    highwayKm,
    carTypeName,
    isKeiDiscountApplied: isKei,
    discountEstimateLateNight,
    discountEstimateHoliday,
    formulaDescription,
  };
}

/**
 * 日本の高速道路（ETC）標準料金を距離から推定
 * NEXCO標準: (高速走行距離km × 24.6円 + 150円) × 1.10
 */
export function estimateHighwayToll(
  roadDistanceKm: number,
  carType: CarTypePreset = 'sedan_suv'
): number {
  if (roadDistanceKm < 20) {
    // 20km未満は一般道優先、または都市高速等の近距離
    return roadDistanceKm > 10 ? 400 : 0;
  }

  // 走行距離のうち約75%〜85%を高速利用と仮定
  const highwayKm = Math.max(0, roadDistanceKm - 12);
  const basePrice = highwayKm * 24.6 + 150;
  let totalPrice = basePrice * 1.1;

  // 軽自動車割引（普通車の約0.8倍）
  if (carType === 'kei') {
    totalPrice *= 0.8;
  }

  // 100円単位四捨五入（ETC端数）
  return Math.round(totalPrice / 100) * 100;
}

/**
 * 2地点間の実走行距離と高速料金を自動算出
 */
export async function estimateRoute(
  fromQuery: string,
  toQuery: string,
  isRoundTrip: boolean = true,
  useHighway: boolean = true,
  carType: CarTypePreset = 'sedan_suv'
): Promise<RouteEstimateResult> {
  const from = await geocodePlace(fromQuery);
  const to = await geocodePlace(toQuery);

  if (!from || !to) {
    throw new Error('出発地または目的地の場所が見つかりませんでした。駅名や観光地名を入力してください。');
  }

  let oneWayDistanceKm = 0;
  let isFallback = false;
  let routeCoordinates: [number, number][] = [
    [from.lat, from.lon],
    [to.lat, to.lon],
  ];

  // OSRM ルーティングAPIによる道路実走行距離と経路ジオメトリの取得
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetch(osrmUrl);
    if (!res.ok) throw new Error('Routing API failed');
    const data = await res.json();
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      oneWayDistanceKm = Math.round((data.routes[0].distance / 1000) * 10) / 10;
      if (data.routes[0].geometry && Array.isArray(data.routes[0].geometry.coordinates)) {
        // GeoJSON は [lon, lat] なので Leaflet / 緯度経度配列 [lat, lon] に変換
        routeCoordinates = data.routes[0].geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]] as [number, number]
        );
      }
    } else {
      throw new Error('No route found');
    }
  } catch (e) {
    console.warn('OSRM routing failed, calculating via Hubeny formula', e);
    isFallback = true;
    // 直線距離 × 道路曲折係数(1.35)
    const straightDist = calculateHubenyDistance(from.lat, from.lon, to.lat, to.lon);
    oneWayDistanceKm = Math.round(straightDist * 1.35 * 10) / 10;
  }

  const multiplier = isRoundTrip ? 2 : 1;
  const totalDistanceKm = Math.round(oneWayDistanceKm * multiplier);

  // 高速代の推定
  const oneWayToll = useHighway ? estimateHighwayToll(oneWayDistanceKm, carType) : 0;
  const totalToll = oneWayToll * multiplier;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    from.name
  )}&destination=${encodeURIComponent(to.name)}&travelmode=driving`;

  return {
    oneWayDistanceKm,
    totalDistanceKm,
    oneWayToll,
    totalToll,
    isRoundTrip,
    useHighway,
    fromName: from.name,
    toName: to.name,
    isFallback,
    fromCoords: { lat: from.lat, lon: from.lon },
    toCoords: { lat: to.lat, lon: to.lon },
    routeCoordinates,
    googleMapsUrl,
  };
}
