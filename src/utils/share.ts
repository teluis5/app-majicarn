import type { SimpleSplitResult, TripData } from '../types/calculator';
import { getMaintenanceRatePerKm } from './calculation';

export function generateShareText(
  trip: TripData,
  result: SimpleSplitResult,
  payPayIdOrLink?: string
): string {
  const { breakdown, passengerCount, totalPeopleCount, passengerShare, driverFree } = result;

  const lines: string[] = [
    '🚗【車代・ドライブ経費の割り勘精算】',
    '━━━━━━━━━━━━━━━━━━',
    `📍 走行距離: ${trip.distanceKm} km`,
    `👥 乗車: 運転手 1名 ＋ 同乗者 ${passengerCount}名 (計${totalPeopleCount}名)`,
    '',
    '💰【費用内訳】',
  ];

  // 1. ガソリン代
  if (breakdown.fuelCost > 0) {
    if (trip.fuelMode === 'calculate') {
      lines.push(
        `・1. ガソリン代: ¥${breakdown.fuelCost.toLocaleString()} (${trip.fuelEfficiency}km/L, @¥${trip.fuelPricePerLiter}/L)`
      );
    } else {
      lines.push(`・1. ガソリン代: ¥${breakdown.fuelCost.toLocaleString()} (実費給油)`);
    }
  } else {
    lines.push('・1. ガソリン代: ¥0');
  }

  // 2. 高速代
  lines.push(`・2. 高速代: ¥${breakdown.transitTotal.toLocaleString()}`);

  // 3. 駐車場等 (駐車・洗車代)
  if (breakdown.parkingEtcTotal > 0) {
    lines.push(`・3. 駐車・洗車代: ¥${breakdown.parkingEtcTotal.toLocaleString()}`);
  } else {
    lines.push('・3. 駐車・洗車代: ¥0');
  }

  // 4. 諸経費 (車両維持費)
  if (breakdown.maintenanceTotal > 0) {
    const rate = getMaintenanceRatePerKm(trip.maintenance);
    lines.push(`・4. 諸経費 (車両維持費): ¥${breakdown.maintenanceTotal.toLocaleString()} (@¥${rate}/km)`);
    lines.push(`  (※タイヤ摩耗・オイル・車検・保険等の客観的按分手当)`);
  } else {
    lines.push('・4. 諸経費 (車両維持費): ¥0');
  }

  lines.push('──────────────────');
  lines.push(`📊 費用総額: ¥${breakdown.grandTotal.toLocaleString()}`);
  lines.push('');

  lines.push('💳【各自のお支払い額】');
  lines.push(`👉 同乗者（1人あたり）: 【 ¥${passengerShare.toLocaleString()} 】`);
  if (driverFree) {
    lines.push('   (※運転手は運転お疲れ様割で ¥0)');
  }

  if (payPayIdOrLink && payPayIdOrLink.trim()) {
    lines.push('');
    lines.push(`📱 送金先 (PayPay ID等): ${payPayIdOrLink.trim()}`);
  }

  lines.push('');
  lines.push('📱 MajiCarn (維持費・諸経費込み車代スマート割り勘)');

  return lines.join('\n');
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    textArea.remove();
    return Promise.resolve(successful);
  } catch {
    return Promise.resolve(false);
  }
}
