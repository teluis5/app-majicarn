import type {
  CarTypePreset,
  CalculationSettings,
  CostBreakdown,
  MaintenanceSettings,
  SimpleSplitResult,
  TripData,
} from '../types/calculator';

// 車種別1kmあたりの維持費レート
export const CAR_TYPE_PRESETS: Record<
  CarTypePreset,
  { name: string; ratePerKm: number; defaultFuelEfficiency: number; description: string; typicalExamples: string }
> = {
  kei: {
    name: '軽自動車',
    ratePerKm: 10,
    defaultFuelEfficiency: 18.0,
    description: '維持費が比較的安価な軽乗用車（N-BOX, ハスラー等）',
    typicalExamples: '車検・保険・タイヤ等の消耗按分: 約10円/km, 燃費目安 18km/L',
  },
  compact: {
    name: 'コンパクトカー',
    ratePerKm: 14,
    defaultFuelEfficiency: 16.0,
    description: '排気量1000〜1500ccクラス（ヤリス, フィット, ノート等）',
    typicalExamples: 'タイヤ・車検等: 約14円/km, 燃費目安 16km/L',
  },
  sedan_suv: {
    name: '普通車 / SUV',
    ratePerKm: 18,
    defaultFuelEfficiency: 13.0,
    description: '排気量1800〜2500cc（カローラ, ヴェゼル, CX-5等）',
    typicalExamples: '消耗品・諸税保険: 約18円/km, 燃費目安 13km/L',
  },
  minivan: {
    name: 'ミニバン / 大型SUV',
    ratePerKm: 22,
    defaultFuelEfficiency: 10.0,
    description: 'ファミリー向け大型ミニバン（セレナ, ヴォクシー, アルファード等）',
    typicalExamples: '重量税・大径タイヤ・オイル消耗: 約22円/km, 燃費目安 10km/L',
  },
  luxury: {
    name: '輸入車 / 高級車',
    ratePerKm: 28,
    defaultFuelEfficiency: 9.0,
    description: '欧州車・プレミアムブランド（BMW, ベンツ, レクサス等）',
    typicalExamples: '指定オイル・高価なタイヤ: 約28円/km, 燃費目安 9km/L',
  },
  custom: {
    name: 'カスタム設定',
    ratePerKm: 15,
    defaultFuelEfficiency: 15.0,
    description: 'ご自身の車両に合わせた任意の単価',
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

  const customExpensesTotal = (trip.customExpenses || []).reduce(
    (sum, item) => sum + Math.max(0, item.amount || 0),
    0
  );

  const expensesDirectTotal =
    highwayToll + parkingFee + carWashFee + customExpensesTotal;

  // 維持費
  const ratePerKm = getMaintenanceRatePerKm(trip.maintenance);
  const maintenanceFull = trip.maintenance.enabled ? Math.round(ratePerKm * (trip.distanceKm || 0)) : 0;
  
  // 割り勘対象とする維持費（負担シェア割合を適用）
  const shareRatio = Math.max(0, Math.min(100, trip.maintenance.burdenSharePercent ?? 100)) / 100;
  const maintenanceTarget = Math.round(maintenanceFull * shareRatio);

  const grandTotal = fuelCost + expensesDirectTotal + maintenanceFull;
  // 同乗者が立て替えた分があれば差し引いて精算
  const passengerAdvance = Math.max(0, trip.passengerAdvancePaid || 0);
  const splitTargetTotal = Math.max(0, fuelCost + expensesDirectTotal + maintenanceTarget - passengerAdvance);

  return {
    fuelCost,
    highwayToll,
    parkingFee,
    carWashFee,
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
 * 運転手1人 ＋ 同乗者N名のスマート割り勘計算
 */
export function calculateSimpleSplit(
  trip: TripData,
  settings: CalculationSettings
): SimpleSplitResult {
  const breakdown = calculateCostBreakdown(trip);
  const passengerCount = Math.max(1, trip.passengerCount || 1);
  const totalPeopleCount = 1 + passengerCount;
  const targetTotal = breakdown.splitTargetTotal;

  let rawPassengerShare = 0;

  if (trip.driverDiscount === 'free') {
    // 運転手は無料：同乗者のみで全額均等割り
    rawPassengerShare = targetTotal / passengerCount;
  } else if (trip.driverDiscount === 'half') {
    // 運転手半額：同乗者1.0、運転手0.5の比率
    const weightTotal = passengerCount + 0.5;
    rawPassengerShare = targetTotal / weightTotal;
  } else {
    // 全員均等割り
    rawPassengerShare = targetTotal / totalPeopleCount;
  }

  // 丸め処理
  const passengerShare = roundAmount(
    rawPassengerShare,
    settings.roundingUnit,
    settings.roundingStrategy
  );

  const totalCollected = passengerShare * passengerCount;
  const driverShare = Math.max(0, targetTotal - totalCollected);

  // 端数調整差額
  breakdown.roundingAdjustment = totalCollected + driverShare - targetTotal;

  const costPerKm = trip.distanceKm > 0 ? Math.round((breakdown.grandTotal / trip.distanceKm) * 10) / 10 : 0;

  return {
    breakdown,
    passengerCount,
    totalPeopleCount,
    costPerKm,
    passengerShare,
    rawPassengerShare: Math.round(rawPassengerShare),
    driverShare: Math.round(driverShare),
    driverFree: trip.driverDiscount === 'free',
    totalCollected,
  };
}
