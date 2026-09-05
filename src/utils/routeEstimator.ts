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

export interface InterchangeInfo {
  name: string;
  highway: string;
  lat: number;
  lon: number;
}

// 日本の主要インターチェンジ（IC / JCT / 料金所）データベース
export const MAJOR_INTERCHANGES: InterchangeInfo[] = [
  // 首都圏・東名・新東名・小田厚・西湘
  { name: '東京IC', highway: '東名高速', lat: 35.6267, lon: 139.6266 },
  { name: '用賀IC', highway: '首都高速3号線', lat: 35.6275, lon: 139.6270 },
  { name: '東名川崎IC', highway: '東名高速', lat: 35.5867, lon: 139.5606 },
  { name: '横浜青葉IC', highway: '東名高速', lat: 35.5519, lon: 139.5303 },
  { name: '横浜町田IC', highway: '東名高速', lat: 35.5085, lon: 139.4975 },
  { name: '海老名IC', highway: '圏央道', lat: 35.4385, lon: 139.3822 },
  { name: '厚木IC', highway: '東名高速 / 小田原厚木道路', lat: 35.4190, lon: 139.3620 },
  { name: '秦野中井IC', highway: '東名高速', lat: 35.3486, lon: 139.2312 },
  { name: '大井松田IC', highway: '東名高速', lat: 35.3378, lon: 139.1558 },
  { name: '御殿場IC', highway: '東名高速', lat: 35.3056, lon: 138.9481 },
  { name: '裾野IC', highway: '東名高速', lat: 35.1836, lon: 138.8953 },
  { name: '沼津IC', highway: '東名高速', lat: 35.1583, lon: 138.8681 },
  { name: '富士IC', highway: '東名高速', lat: 35.1783, lon: 138.6653 },
  { name: '静岡IC', highway: '東名高速', lat: 34.9525, lon: 138.3967 },
  { name: '平塚IC', highway: '小田原厚木道路', lat: 35.3622, lon: 139.2997 },
  { name: '大磯IC', highway: '小田原厚木道路', lat: 35.3283, lon: 139.2811 },
  { name: '小田原東IC', highway: '小田原厚木道路', lat: 35.2819, lon: 139.1822 },
  { name: '小田原西IC', highway: '小田原厚木道路 / 西湘バイパス', lat: 35.2447, lon: 139.1312 },
  { name: '箱根口IC', highway: '小田原箱根道路 / 箱根新道', lat: 35.2374, lon: 139.1200 },
  { name: '山崎IC', highway: '箱根新道', lat: 35.2314, lon: 139.1064 },
  { name: '早川IC', highway: '西湘バイパス', lat: 35.2392, lon: 139.1458 },
  { name: '湯河原料金所', highway: '熱海ビーチライン', lat: 35.1436, lon: 139.1089 },
  // 中央道・首都高4号・富士五湖
  { name: '高井戸IC', highway: '中央自動車道 / 首都高4号', lat: 35.6685, lon: 139.6150 },
  { name: '調布IC', highway: '中央自動車道', lat: 35.6561, lon: 139.5303 },
  { name: '国立府中IC', highway: '中央自動車道', lat: 35.6742, lon: 139.4447 },
  { name: '八王子IC', highway: '中央自動車道', lat: 35.6817, lon: 139.3400 },
  { name: '相模湖IC', highway: '中央自動車道', lat: 35.6144, lon: 139.1839 },
  { name: '上野原IC', highway: '中央自動車道', lat: 35.6267, lon: 139.1075 },
  { name: '大月IC', highway: '中央自動車道', lat: 35.6139, lon: 138.9328 },
  { name: '都留IC', highway: '中央自動車道(富士吉田線)', lat: 35.5458, lon: 138.9042 },
  { name: '河口湖IC', highway: '中央自動車道(富士吉田線)', lat: 35.4856, lon: 138.7658 },
  { name: '富士吉田IC', highway: '東富士五湖道路', lat: 35.4742, lon: 138.7900 },
  { name: '甲府南IC', highway: '中央自動車道', lat: 35.6022, lon: 138.5753 },
  { name: '諏訪IC', highway: '中央自動車道', lat: 35.9856, lon: 138.1306 },
  // 関越道・上信越道
  { name: '練馬IC', highway: '関越自動車道', lat: 35.7483, lon: 139.6056 },
  { name: '所沢IC', highway: '関越自動車道', lat: 35.8114, lon: 139.5447 },
  { name: '川越IC', highway: '関越自動車道', lat: 35.8950, lon: 139.4489 },
  { name: '東松山IC', highway: '関越自動車道', lat: 36.0125, lon: 139.3883 },
  { name: '花園IC', highway: '関越自動車道', lat: 36.1264, lon: 139.2392 },
  { name: '高崎IC', highway: '関越自動車道', lat: 36.3314, lon: 139.0622 },
  { name: '藤岡JCT / IC', highway: '上信越自動車道', lat: 36.2625, lon: 139.0833 },
  { name: '富岡IC', highway: '上信越自動車道', lat: 36.2483, lon: 138.9022 },
  { name: '下仁田IC', highway: '上信越自動車道', lat: 36.2208, lon: 138.7944 },
  { name: '碓氷軽井沢IC', highway: '上信越自動車道', lat: 36.3106, lon: 138.6508 },
  { name: '前橋IC', highway: '関越自動車道', lat: 36.3775, lon: 139.0272 },
  { name: '渋川伊香保IC', highway: '関越自動車道', lat: 36.4808, lon: 139.0194 },
  { name: '沼田IC', highway: '関越自動車道', lat: 36.6667, lon: 139.0647 },
  // 東北道・日光宇都宮道路・常磐道
  { name: '浦和IC / 川口JCT', highway: '東北自動車道', lat: 35.8567, lon: 139.7342 },
  { name: '久喜IC', highway: '東北自動車道', lat: 36.0683, lon: 139.6467 },
  { name: '羽生IC', highway: '東北自動車道', lat: 36.1750, lon: 139.5700 },
  { name: '館林IC', highway: '東北自動車道', lat: 36.2308, lon: 139.5719 },
  { name: '佐野藤岡IC', highway: '東北自動車道', lat: 36.2942, lon: 139.6108 },
  { name: '栃木IC', highway: '東北自動車道', lat: 36.4022, lon: 139.7183 },
  { name: '鹿沼IC', highway: '東北自動車道', lat: 36.5283, lon: 139.8058 },
  { name: '宇都宮IC', highway: '東北自動車道 / 日光宇都宮道路', lat: 36.6347, lon: 139.8433 },
  { name: '今市IC', highway: '日光宇都宮道路', lat: 36.7264, lon: 139.6961 },
  { name: '日光IC', highway: '日光宇都宮道路', lat: 36.7486, lon: 139.6247 },
  { name: '清滝IC', highway: '日光宇都宮道路', lat: 36.7472, lon: 139.5639 },
  { name: '三郷IC', highway: '常磐自動車道', lat: 35.8368, lon: 139.8787 },
  { name: '流山IC', highway: '常磐自動車道', lat: 35.8750, lon: 139.9100 },
  { name: '柏IC', highway: '常磐自動車道', lat: 35.9086, lon: 139.9328 },
  { name: '谷和原IC', highway: '常磐自動車道', lat: 35.9750, lon: 139.9917 },
  { name: 'つくば中央IC', highway: '圏央道', lat: 36.0647, lon: 140.0667 },
  { name: '水戸IC', highway: '常磐自動車道', lat: 36.3861, lon: 140.3750 },
  // 湾岸・アクアライン・東関東道・横横
  { name: '浮島IC / 川崎浮島JCT', highway: '東京湾アクアライン / 首都高湾岸線', lat: 35.5283, lon: 139.7828 },
  { name: '木更津金田IC', highway: '東京湾アクアライン', lat: 35.4339, lon: 139.9078 },
  { name: '木更津南IC', highway: '館山自動車道', lat: 35.3378, lon: 139.9197 },
  { name: '君津IC', highway: '館山自動車道', lat: 35.3117, lon: 139.9575 },
  { name: '富浦IC', highway: '富津館山道路', lat: 35.0483, lon: 139.8517 },
  { name: '湾岸市川IC', highway: '東関東自動車道', lat: 35.6886, lon: 139.9722 },
  { name: '成田IC', highway: '東関東自動車道', lat: 35.7686, lon: 140.3472 },
  { name: '朝比奈IC', highway: '横浜横須賀道路', lat: 35.3347, lon: 139.6014 },
  { name: '逗子IC', highway: '逗葉新道 / 横浜横須賀道路', lat: 35.2986, lon: 139.6000 },
  // 関西・名神・新名神・阪神高速・淡路
  { name: '豊中IC', highway: '名神高速 / 阪神高速11号池田線', lat: 34.7578, lon: 135.4744 },
  { name: '吹田IC', highway: '名神高速 / 近畿道 / 中国道', lat: 34.7867, lon: 135.5350 },
  { name: '茨木IC', highway: '名神高速', lat: 34.8294, lon: 135.5658 },
  { name: '高槻IC', highway: '新名神高速', lat: 34.8622, lon: 135.6267 },
  { name: '京都南IC', highway: '名神高速', lat: 34.9542, lon: 135.7508 },
  { name: '京都東IC', highway: '名神高速', lat: 34.9856, lon: 135.8208 },
  { name: '大津IC', highway: '名神高速', lat: 34.9853, lon: 135.8925 },
  { name: '西宮IC', highway: '名神高速 / 阪神高速3号神戸線', lat: 34.7297, lon: 135.3406 },
  { name: '神戸西IC', highway: '山陽自動車道 / 神戸淡路鳴門道', lat: 34.7108, lon: 135.0800 },
  { name: '垂水IC / JCT', highway: '神戸淡路鳴門道 / 第二神明', lat: 34.6547, lon: 135.0683 },
  { name: '淡路IC', highway: '神戸淡路鳴門道 (明石海峡大橋)', lat: 34.5878, lon: 135.0189 },
  { name: '東浦IC', highway: '神戸淡路鳴門道', lat: 34.5367, lon: 135.0069 },
  { name: '洲本IC', highway: '神戸淡路鳴門道', lat: 34.3494, lon: 134.8778 },
  { name: '鳴門IC', highway: '神戸淡路鳴門道', lat: 34.1756, lon: 134.5842 },
  // 中部・東名・伊勢道・中央道
  { name: '春日井IC', highway: '東名高速', lat: 35.2656, lon: 136.9950 },
  { name: '小牧IC', highway: '東名高速 / 名神高速', lat: 35.2917, lon: 136.9042 },
  { name: '名古屋IC', highway: '東名高速 / 名二環', lat: 35.1783, lon: 137.0150 },
  { name: '豊田IC', highway: '東名高速', lat: 35.0567, lon: 137.1306 },
  { name: '岡崎IC', highway: '東名高速', lat: 34.9383, lon: 137.1950 },
  { name: '四日市IC', highway: '東名阪自動車道', lat: 34.9950, lon: 136.5417 },
  { name: '亀山IC', highway: '東名阪道 / 新名神 / 名阪国道', lat: 34.8628, lon: 136.4394 },
  { name: '津IC', highway: '伊勢自動車道', lat: 34.7214, lon: 136.4719 },
  { name: '松阪IC', highway: '伊勢自動車道', lat: 34.5956, lon: 136.4883 },
  { name: '伊勢IC', highway: '伊勢自動車道 (伊勢神宮)', lat: 34.4858, lon: 136.7358 }
];

/**
 * 与えられた緯度経度に最も近い主要ICを検索
 */
export function findNearestInterchange(
  lat: number,
  lon: number,
  maxDistanceKm: number = 35
): InterchangeInfo | null {
  let nearest: InterchangeInfo | null = null;
  let minDist = Infinity;
  for (const ic of MAJOR_INTERCHANGES) {
    const dist = calculateHubenyDistance(lat, lon, ic.lat, ic.lon);
    if (dist < minDist) {
      minDist = dist;
      nearest = ic;
    }
  }
  return nearest && minDist <= maxDistanceKm ? nearest : null;
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
  // インターチェンジ間実走行情報
  entryICName?: string;
  exitICName?: string;
  highwayDistanceKm?: number; // インターチェンジ間の実走行距離 (km)
  highwayRoadNames?: string[]; // 利用した高速道路名リスト
}

export interface HighwayTollBreakdown {
  estimatedToll: number; // 推定高速代合計
  oneWayToll: number; // 片道高速代
  isRoundTrip: boolean; // 往復かどうか
  highwayKm: number; // 高速推定・実走行距離 (片道)
  carTypeName: string; // 適用車種名 (普通車・軽自動車等)
  isKeiDiscountApplied: boolean; // 軽自動車割引適用有無
  discountEstimateLateNight: number; // 深夜割引目安 (30%OFF)
  discountEstimateHoliday: number; // 休日割引目安 (30%OFF)
  formulaDescription: string; // 計算式の解説
  entryICName?: string; // 乗ったIC
  exitICName?: string; // 降りたIC
  highwayRoadNames?: string[]; // 利用高速道路名
}

/**
 * 高速代の内訳詳細情報を取得
 */
export function getHighwayTollBreakdown(
  totalRoadDistanceKm: number,
  isRoundTrip: boolean,
  carType: CarTypePreset = 'sedan_suv',
  currentToll?: number,
  routeResult?: RouteEstimateResult | null
): HighwayTollBreakdown {
  const oneWayDistanceKm = isRoundTrip ? Math.round((totalRoadDistanceKm / 2) * 10) / 10 : totalRoadDistanceKm;
  
  // OSRM等からインターチェンジ間の実走行距離が取得できている場合はそちらを優先
  const actualHighwayKm = routeResult?.highwayDistanceKm !== undefined && routeResult.highwayDistanceKm > 0
    ? routeResult.highwayDistanceKm
    : Math.max(0, Math.round(oneWayDistanceKm - 12));

  const oneWayToll = estimateHighwayToll(oneWayDistanceKm, carType, actualHighwayKm);
  const estimatedTotal = oneWayToll * (isRoundTrip ? 2 : 1);
  const activeToll = currentToll !== undefined && currentToll > 0 ? currentToll : estimatedTotal;

  const isKei = carType === 'kei';
  const carTypeName = isKei ? '軽自動車（約20%割引区分）' : '普通車・SUV・ミニバン（標準区分）';

  // ETC深夜・休日割引（約30%割引）
  const discountEstimateLateNight = Math.round((activeToll * 0.7) / 100) * 100;
  const discountEstimateHoliday = Math.round((activeToll * 0.7) / 100) * 100;

  const baseFormula = actualHighwayKm > 0
    ? `IC間実走行${actualHighwayKm}km × 24.6円 + 150円`
    : `高速区間約${actualHighwayKm}km × 24.6円 + 150円`;

  let formulaDescription = `NEXCO標準: (${baseFormula}) × 1.10`;
  if (isKei) {
    formulaDescription += ' × 軽自動車割引0.8';
  }

  return {
    estimatedToll: activeToll,
    oneWayToll,
    isRoundTrip,
    highwayKm: actualHighwayKm,
    carTypeName,
    isKeiDiscountApplied: isKei,
    discountEstimateLateNight,
    discountEstimateHoliday,
    formulaDescription,
    entryICName: routeResult?.entryICName,
    exitICName: routeResult?.exitICName,
    highwayRoadNames: routeResult?.highwayRoadNames,
  };
}

/**
 * 日本の高速道路（ETC）標準料金を距離から推定
 * NEXCO標準: (高速実走行距離km × 24.6円 + 150円) × 1.10
 */
export function estimateHighwayToll(
  roadDistanceKm: number,
  carType: CarTypePreset = 'sedan_suv',
  customHighwayKm?: number
): number {
  if (roadDistanceKm < 15 && (!customHighwayKm || customHighwayKm < 5)) {
    // 短距離は一般道利用が通常
    return roadDistanceKm > 8 ? 400 : 0;
  }

  // customHighwayKmがあればIC間実走行距離を採用
  const highwayKm = customHighwayKm !== undefined && customHighwayKm > 0
    ? customHighwayKm
    : Math.max(0, roadDistanceKm - 12);

  if (highwayKm <= 0) return 0;

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
  let highwayDistanceKm = 0;
  let entryICName: string | undefined;
  let exitICName: string | undefined;
  let highwayRoadNames: string[] = [];

  // OSRM ルーティングAPIによる道路実走行距離と経路ジオメトリ・ステップの取得
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(osrmUrl);
    if (!res.ok) throw new Error('Routing API failed');
    const data = await res.json();
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      oneWayDistanceKm = Math.round((route.distance / 1000) * 10) / 10;
      if (route.geometry && Array.isArray(route.geometry.coordinates)) {
        // GeoJSON は [lon, lat] なので Leaflet / 緯度経度配列 [lat, lon] に変換
        routeCoordinates = route.geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]] as [number, number]
        );
      }

      // インターチェンジ間実走行区間の解析
      if (route.legs && route.legs[0] && Array.isArray(route.legs[0].steps)) {
        const steps = route.legs[0].steps;
        const motorwaySteps: Array<{
          name: string;
          distance: number;
          lat: number;
          lon: number;
        }> = [];

        for (const step of steps) {
          const name = step.name || '';
          const ref = step.ref || '';
          const isMotorway =
            name.includes('高速') ||
            name.includes('自動車道') ||
            name.includes('有料') ||
            name.includes('道路公社') ||
            name.includes('バイパス') ||
            ref.startsWith('E') ||
            ref.startsWith('C') ||
            step.mode === 'motorway';

          if (isMotorway && step.distance > 300) {
            const lat = step.maneuver?.location ? step.maneuver.location[1] : 0;
            const lon = step.maneuver?.location ? step.maneuver.location[0] : 0;
            motorwaySteps.push({
              name,
              distance: step.distance,
              lat,
              lon,
            });
          }
        }

        if (motorwaySteps.length > 0) {
          const totalMeters = motorwaySteps.reduce((acc, s) => acc + s.distance, 0);
          highwayDistanceKm = Math.round((totalMeters / 1000) * 10) / 10;

          // ユニークな利用道路名
          const roadSet = new Set<string>();
          motorwaySteps.forEach((s) => {
            if (s.name && s.name.length > 1) {
              roadSet.add(s.name);
            }
          });
          highwayRoadNames = Array.from(roadSet);

          // 最初と最後の高速ステップから乗車IC・降車ICを検索
          const firstM = motorwaySteps[0];
          const lastM = motorwaySteps[motorwaySteps.length - 1];

          if (firstM.lat && firstM.lon) {
            const entryMatch = findNearestInterchange(firstM.lat, firstM.lon, 25);
            if (entryMatch) {
              entryICName = entryMatch.name;
            }
          }
          if (lastM.lat && lastM.lon) {
            const exitMatch = findNearestInterchange(lastM.lat, lastM.lon, 25);
            if (exitMatch) {
              exitICName = exitMatch.name;
            }
          }
        }
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

  // 近傍ICのフォールバック補完（OSRMステップから直接ヒットしなかった場合、出発地・目的地の最寄りICから補完）
  if (!entryICName && oneWayDistanceKm > 20) {
    const fromIC = findNearestInterchange(from.lat, from.lon, 40);
    if (fromIC) entryICName = fromIC.name;
  }
  if (!exitICName && oneWayDistanceKm > 20) {
    const toIC = findNearestInterchange(to.lat, to.lon, 40);
    if (toIC) exitICName = toIC.name;
  }

  const multiplier = isRoundTrip ? 2 : 1;
  const totalDistanceKm = Math.round(oneWayDistanceKm * multiplier);

  // インターチェンジ間実走行距離を基に高速代を推定
  const oneWayToll = useHighway
    ? estimateHighwayToll(oneWayDistanceKm, carType, highwayDistanceKm > 0 ? highwayDistanceKm : undefined)
    : 0;
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
    entryICName,
    exitICName,
    highwayDistanceKm,
    highwayRoadNames,
  };
}
