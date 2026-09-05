import type {
  CarTypePreset,
  CalculationSettings,
  CostBreakdown,
  MaintenanceSettings,
  Member,
  MemberSettlement,
  PaymentTransfer,
  SplitResult,
  TripData,
} from '../types/calculator';

// 車種別1kmあたりの維持費レート（車検・自賠責・任意保険・自動車税・オイル/タイヤ/ブレーキ等の消耗品目安）
export const CAR_TYPE_PRESETS: Record<
  CarTypePreset,
  { name: string; ratePerKm: number; description: string; typicalExamples: string }
> = {
  kei: {
    name: '軽自動車',
    ratePerKm: 10,
    description: '維持費が比較的安価な軽乗用車（N-BOX, タント, ハスラー等）',
    typicalExamples: '車検・保険・タイヤ・オイル等の消耗按分: 約10円/km',
  },
  compact: {
    name: 'コンパクトカー',
    ratePerKm: 14,
    description: '排気量1000〜1500ccクラス（ヤリス, フィット, ノート等）',
    typicalExamples: 'タイヤ・車検・定期点検等: 約14円/km',
  },
  sedan_suv: {
    name: '普通車 / ミドルSUV',
    ratePerKm: 18,
    description: '排気量1800〜2500cc（プリウス, CX-5, ヴェゼル, カローラ等）',
    typicalExamples: '消耗品・タイヤ交換・諸税保険: 約18円/km',
  },
  minivan: {
    name: 'ミニバン / 大型SUV',
    ratePerKm: 22,
    description: 'ファミリー向け大型ミニバン（ヴォクシー, セレナ, アルファード, ランドクルーザー等）',
    typicalExamples: '重量税・大径タイヤ・ブレーキ消耗・オイル容量大: 約22円/km',
  },
  luxury: {
    name: '輸入車 / 高級スポーツ',
    ratePerKm: 28,
    description: '欧州車・プレミアムブランド（BMW, ベンツ, レクサス等）',
    typicalExamples: '指定オイル・高価なタイヤ・部品代・定期点検費用: 約28円/km',
  },
  custom: {
    name: 'カスタム設定',
    ratePerKm: 15,
    description: 'ご自身の車両に合わせた任意のkm単価',
    typicalExamples: '自由設定',
  },
};

/**
 * 1kmあたりの維持費レートを取得
 */
export function getMaintenanceRatePerKm(maintenance: MaintenanceSettings): number {
  if (!maintenance.enabled) return 0;
  if (maintenance.mode === 'preset') {
    if (maintenance.carType === 'custom') {
      return Math.max(0, maintenance.customRatePerKm);
    }
    return CAR_TYPE_PRESETS[maintenance.carType]?.ratePerKm ?? 15;
  }

  // 詳細計算モード
  const { annualMileage, annualInspectionCost, annualInsuranceCost, annualTaxCost, annualMaintenanceCost } =
    maintenance.detailed;
  if (!annualMileage || annualMileage <= 0) return 0;
  const annualTotal =
    (annualInspectionCost || 0) +
    (annualInsuranceCost || 0) +
    (annualTaxCost || 0) +
    (annualMaintenanceCost || 0);
  return Math.round((annualTotal / annualMileage) * 10) / 10;
}

/**
 * ガソリン代の計算
 */
export function calculateFuelCost(trip: TripData): number {
  if (trip.fuelMode === 'actual') {
    return Math.max(0, trip.actualFuelCost || 0);
  }
  if (!trip.distanceKm || trip.distanceKm <= 0 || !trip.fuelEfficiency || trip.fuelEfficiency <= 0) {
    return 0;
  }
  const liters = trip.distanceKm / trip.fuelEfficiency;
  return Math.round(liters * (trip.fuelPricePerLiter || 0));
}

/**
 * 諸経費・維持費を含む費目別合計の計算
 */
export function calculateCostBreakdown(trip: TripData): CostBreakdown {
  const fuelCost = calculateFuelCost(trip);
  const highwayToll = Math.max(0, trip.highwayToll || 0);
  const parkingFee = Math.max(0, trip.parkingFee || 0);
  const carWashFee = Math.max(0, trip.carWashFee || 0);
  const rentalFee = Math.max(0, trip.rentalFee || 0);

  const customExpensesTotal = (trip.customExpenses || []).reduce(
    (sum, item) => sum + Math.max(0, item.amount || 0),
    0
  );

  const expensesDirectTotal =
    highwayToll + parkingFee + carWashFee + rentalFee + customExpensesTotal;

  // 維持費
  const ratePerKm = getMaintenanceRatePerKm(trip.maintenance);
  const maintenanceFull = trip.maintenance.enabled ? Math.round(ratePerKm * (trip.distanceKm || 0)) : 0;
  
  // 割り勘対象とする維持費（負担シェア割合を適用）
  const shareRatio = Math.max(0, Math.min(100, trip.maintenance.burdenSharePercent ?? 100)) / 100;
  const maintenanceTarget = Math.round(maintenanceFull * shareRatio);

  const grandTotal = fuelCost + expensesDirectTotal + maintenanceFull;
  const splitTargetTotal = fuelCost + expensesDirectTotal + maintenanceTarget;

  return {
    fuelCost,
    highwayToll,
    parkingFee,
    carWashFee,
    rentalFee,
    customExpensesTotal,
    expensesDirectTotal,
    maintenanceTotal: maintenanceFull,
    grandTotal,
    splitTargetTotal,
    roundingAdjustment: 0,
  };
}

/**
 * 丸め処理
 */
export function roundAmount(
  amount: number,
  unit: CalculationSettings['roundingUnit'],
  strategy: CalculationSettings['roundingStrategy']
): number {
  if (unit <= 1) {
    return Math.round(amount);
  }
  const factor = unit;
  if (strategy === 'ceil') {
    return Math.ceil(amount / factor) * factor;
  }
  if (strategy === 'floor') {
    return Math.floor(amount / factor) * factor;
  }
  return Math.round(amount / factor) * factor;
}

/**
 * 各メンバーの立替支払い合計を計算
 */
export function getMemberTotalPaid(memberId: string, trip: TripData, members: Member[]): number {
  let paid = 0;
  const currentMember = members.find((m) => m.id === memberId);
  if (currentMember) {
    paid += currentMember.extraAdvancePaid || 0;
  }

  // ガソリン代を実費入力した場合はオーナー（または指定の支払い者）
  if (trip.fuelMode === 'actual' && trip.actualFuelCost > 0) {
    const owner = members.find((m) => m.isOwner) || members[0];
    if (owner && owner.id === memberId) {
      paid += trip.actualFuelCost;
    }
  }

  if (trip.highwayPaidBy === memberId) paid += trip.highwayToll || 0;
  if (trip.parkingPaidBy === memberId) paid += trip.parkingFee || 0;
  if (trip.carWashPaidBy === memberId) paid += trip.carWashFee || 0;
  if (trip.rentalPaidBy === memberId) paid += trip.rentalFee || 0;

  for (const exp of trip.customExpenses || []) {
    if (exp.paidByMemberId === memberId) {
      paid += exp.amount || 0;
    }
  }

  // 維持費は車両オーナーが所有車を提供したことに対する権利金として、
  // オーナーの「立替・提供済みコスト」として扱われる
  if (currentMember?.isOwner && trip.maintenance.enabled) {
    const ratePerKm = getMaintenanceRatePerKm(trip.maintenance);
    const maintenanceFull = Math.round(ratePerKm * (trip.distanceKm || 0));
    paid += maintenanceFull;
  }

  return paid;
}

/**
 * 割り勘計算
 */
export function calculateSplit(
  trip: TripData,
  members: Member[],
  settings: CalculationSettings
): SplitResult {
  const breakdown = calculateCostBreakdown(trip);
  const memberCount = members.length;

  if (memberCount === 0) {
    return {
      breakdown,
      members: [],
      transfers: [],
      costPerKm: trip.distanceKm > 0 ? Math.round(breakdown.grandTotal / trip.distanceKm) : 0,
    };
  }

  // 1. 各自の割引設定を確認し、重み付けまたは控除額を算出
  // まず割引なしの場合の基本シェア
  const targetTotal = breakdown.splitTargetTotal;

  // ドライバー無料や固定割引を考慮した計算
  // ステップ1: 固定割引（無料含む）のメンバーを特定
  let nonFreeMemberCount = 0;
  const memberDiscountAmounts: Record<string, number> = {};

  for (const member of members) {
    if (member.discountType === 'free') {
      // 全額無料
      memberDiscountAmounts[member.id] = 0; // 負担額ゼロ
    } else {
      nonFreeMemberCount++;
    }
  }

  if (nonFreeMemberCount === 0) {
    // 全員無料設定などの例外時は全員均等
    nonFreeMemberCount = memberCount;
  }

  // 通常メンバーの暫定ベース額
  const rawBaseShare = targetTotal / nonFreeMemberCount;

  for (const member of members) {
    if (member.discountType === 'free') {
      memberDiscountAmounts[member.id] = rawBaseShare; // 割引された金額
    } else if (member.discountType === 'percent') {
      const discountRatio = Math.max(0, Math.min(100, member.discountValue || 0)) / 100;
      memberDiscountAmounts[member.id] = rawBaseShare * discountRatio;
    } else if (member.discountType === 'fixed') {
      memberDiscountAmounts[member.id] = Math.min(rawBaseShare, member.discountValue || 0);
    } else {
      memberDiscountAmounts[member.id] = 0;
    }
  }

  // 総割引額を計算し、割引を受けていない（または受けている人以外）に再配分
  const totalDiscounts = Object.values(memberDiscountAmounts).reduce((a, b) => a + b, 0);

  // 割引を受ける人を除いたメンバーで割引分を肩代わり（公平な按分）
  const payingMembers = members.filter((m) => m.discountType !== 'free');
  const discountBurdenPerPerson =
    payingMembers.length > 0 ? totalDiscounts / payingMembers.length : 0;

  const memberSettlements: MemberSettlement[] = [];
  let sumRoundedShare = 0;

  for (const member of members) {
    let subtotal = 0;
    if (member.discountType === 'free') {
      subtotal = 0;
    } else {
      const discount = memberDiscountAmounts[member.id] || 0;
      subtotal = Math.max(0, rawBaseShare - discount + discountBurdenPerPerson);
    }

    const roundedShare = member.discountType === 'free' ? 0 : roundAmount(subtotal, settings.roundingUnit, settings.roundingStrategy);
    sumRoundedShare += roundedShare;

    const totalPaid = getMemberTotalPaid(member.id, trip, members);

    memberSettlements.push({
      memberId: member.id,
      name: member.name,
      isOwner: member.isOwner,
      isDriver: member.isDriver,
      baseShare: Math.round(rawBaseShare),
      discountAmount: Math.round(memberDiscountAmounts[member.id] || 0),
      subtotal: Math.round(subtotal),
      roundedShare,
      totalPaid,
      netBalance: roundedShare - totalPaid, // 正: 送金が必要, 負: 回収可能
    });
  }

  // 端数処理による誤差
  const roundingAdjustment = sumRoundedShare - targetTotal;
  breakdown.roundingAdjustment = roundingAdjustment;

  // 最小送金ステップを計算
  const transfers = calculateSettlements(memberSettlements);

  const costPerKm = trip.distanceKm > 0 ? Math.round((breakdown.grandTotal / trip.distanceKm) * 10) / 10 : 0;

  return {
    breakdown,
    members: memberSettlements,
    transfers,
    costPerKm,
  };
}

/**
 * 最小取引数で精算するグリーディ（貪欲）送金アルゴリズム
 */
export function calculateSettlements(settlements: MemberSettlement[]): PaymentTransfer[] {
  // netBalance > 0: 支払う必要がある（債務）
  // netBalance < 0: 受け取る必要がある（債権）
  type DebtItem = { id: string; name: string; amount: number };

  const debtors: DebtItem[] = [];
  const creditors: DebtItem[] = [];

  for (const s of settlements) {
    if (s.netBalance > 0) {
      debtors.push({ id: s.memberId, name: s.name, amount: s.netBalance });
    } else if (s.netBalance < 0) {
      creditors.push({ id: s.memberId, name: s.name, amount: -s.netBalance });
    }
  }

  // 金額の大きい順にソート
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transfers: PaymentTransfer[] = [];

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const transferAmount = Math.min(debtor.amount, creditor.amount);

    if (transferAmount > 0) {
      transfers.push({
        fromMemberId: debtor.id,
        fromName: debtor.name,
        toMemberId: creditor.id,
        toName: creditor.name,
        amount: Math.round(transferAmount),
      });

      debtor.amount -= transferAmount;
      creditor.amount -= transferAmount;
    }

    if (debtor.amount <= 0.01) dIdx++;
    if (creditor.amount <= 0.01) cIdx++;
  }

  return transfers;
}
