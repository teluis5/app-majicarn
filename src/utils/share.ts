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

  if (breakdown.fuelCost > 0) {
    if (trip.fuelMode === 'calculate') {
      lines.push(`・ガソリン代: ¥${breakdown.fuelCost.toLocaleString()} (@¥${trip.fuelPricePerLiter}/L, 燃費 ${trip.fuelEfficiency}km/L)`);
    } else {
      lines.push(`・ガソリン代: ¥${breakdown.fuelCost.toLocaleString()} (給油実費)`);
    }
  }

  if (breakdown.highwayToll > 0) {
    lines.push(`・高速・ETC代: ¥${breakdown.highwayToll.toLocaleString()}`);
  }
  if (breakdown.parkingFee > 0) {
    lines.push(`・駐車場代: ¥${breakdown.parkingFee.toLocaleString()}`);
  }
  if (breakdown.carWashFee > 0) {
    lines.push(`・洗車代: ¥${breakdown.carWashFee.toLocaleString()}`);
  }

  for (const exp of trip.customExpenses || []) {
    if (exp.amount > 0) {
      lines.push(`・${exp.name}: ¥${exp.amount.toLocaleString()}`);
    }
  }

  if (breakdown.maintenanceTotal > 0) {
    const rate = getMaintenanceRatePerKm(trip.maintenance);
    lines.push(`・車両維持費: ¥${breakdown.maintenanceTotal.toLocaleString()} (@¥${rate}/km)`);
    lines.push(`  (※車検・保険・タイヤ等の走行消耗手当分)`);
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
