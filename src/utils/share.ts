import type { SplitResult, TripData } from '../types/calculator';
import { getMaintenanceRatePerKm } from './calculation';

export function generateShareText(
  trip: TripData,
  result: SplitResult,
  payPayIdOrLink?: string
): string {
  const { breakdown, members, transfers } = result;

  const lines: string[] = [
    '🚗【車代・ドライブ経費の割り勘精算】',
    '━━━━━━━━━━━━━━━━━━',
    `📍 走行距離: ${trip.distanceKm} km`,
    '',
    '💰【費用内訳】',
  ];

  if (breakdown.fuelCost > 0) {
    if (trip.fuelMode === 'calculate') {
      lines.push(`・ガソリン代: ¥${breakdown.fuelCost.toLocaleString()} (燃費 ${trip.fuelEfficiency}km/L, @¥${trip.fuelPricePerLiter}/L)`);
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
  if (breakdown.rentalFee > 0) {
    lines.push(`・レンタカー/シェア代: ¥${breakdown.rentalFee.toLocaleString()}`);
  }

  for (const exp of trip.customExpenses || []) {
    if (exp.amount > 0) {
      lines.push(`・${exp.name}: ¥${exp.amount.toLocaleString()}`);
    }
  }

  if (breakdown.maintenanceTotal > 0) {
    const rate = getMaintenanceRatePerKm(trip.maintenance);
    lines.push(`・車両維持費: ¥${breakdown.maintenanceTotal.toLocaleString()} (@¥${rate}/km)`);
    lines.push(`  (※車検・保険・タイヤ/オイル等の走行消耗コスト分)`);
  }

  lines.push('──────────────────');
  lines.push(`📊 費用総額: ¥${breakdown.grandTotal.toLocaleString()}`);
  if (breakdown.splitTargetTotal !== breakdown.grandTotal) {
    lines.push(`👥 割り勘対象額: ¥${breakdown.splitTargetTotal.toLocaleString()}`);
  }
  lines.push('');

  lines.push('👥【各自の負担額】');
  for (const m of members) {
    let tag = '';
    if (m.isOwner && m.isDriver) tag = ' (🚗車主/運転手)';
    else if (m.isOwner) tag = ' (🚗車主)';
    else if (m.isDriver) tag = ' (🏎️運転手)';

    let discountInfo = '';
    if (m.discountAmount > 0) {
      discountInfo = ` [優遇割 -¥${m.discountAmount.toLocaleString()}]`;
    }

    lines.push(`・${m.name}${tag}: ¥${m.roundedShare.toLocaleString()}${discountInfo}`);
  }
  lines.push('');

  if (transfers.length > 0) {
    lines.push('💳【精算・送金案内】');
    for (const t of transfers) {
      lines.push(`👉 ${t.fromName} さん ➔ ${t.toName} さんへ 【¥${t.amount.toLocaleString()}】`);
    }
  } else {
    lines.push('✅ 全員の支払いが完了・相殺されています');
  }

  if (payPayIdOrLink && payPayIdOrLink.trim()) {
    lines.push('');
    lines.push(`📱 送金先 (PayPay ID等): ${payPayIdOrLink.trim()}`);
  }

  lines.push('');
  lines.push('📱 MajiCarn (維持費・諸経費込み車代割り勘)');

  return lines.join('\n');
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  // フォールバック
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
