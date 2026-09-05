export type FuelCalculationMode = 'calculate' | 'actual';

export type CarTypePreset = 'kei' | 'compact' | 'sedan_suv' | 'minivan' | 'luxury' | 'custom';

export interface MaintenanceSettings {
  enabled: boolean;
  mode: 'preset' | 'detailed';
  carType: CarTypePreset;
  customRatePerKm: number; // 円/km
  burdenSharePercent: number; // 同乗者と分担する割合（100%なら全員で等分、50%ならオーナーが半分負担）
  // 詳細モード用の入力項目
  detailed: {
    annualMileage: number; // 年間走行距離 (km)
    annualInspectionCost: number; // 車検費用 (2年分なら÷2)
    annualInsuranceCost: number; // 任意保険・自賠責 (年額)
    annualTaxCost: number; // 自動車税・重量税 (年額)
    annualMaintenanceCost: number; // オイル、タイヤ、消耗品等 (年額)
  };
}

export interface CustomExpense {
  id: string;
  name: string;
  amount: number;
  paidByMemberId: string; // 支払った人
}

export interface TripData {
  distanceKm: number; // 走行距離
  fuelMode: FuelCalculationMode;
  fuelEfficiency: number; // 燃費 (km/L)
  fuelPricePerLiter: number; // ガソリン単価 (円/L)
  actualFuelCost: number; // 実費給油額 (円)
  highwayToll: number; // 高速道路・ETC料金
  highwayPaidBy: string;
  parkingFee: number; // 駐車場代
  parkingPaidBy: string;
  carWashFee: number; // 洗車代
  carWashPaidBy: string;
  rentalFee: number; // レンタカー・シェアカー代（もしあれば）
  rentalPaidBy: string;
  customExpenses: CustomExpense[];
  maintenance: MaintenanceSettings;
}

export type DiscountType = 'none' | 'free' | 'percent' | 'fixed';

export interface Member {
  id: string;
  name: string;
  isOwner: boolean; // 車両オーナー
  isDriver: boolean; // 運転手
  discountType: DiscountType; // ドライバー/オーナー等への優遇
  discountValue: number; // 割引率(%) または 固定割引額(円)
  extraAdvancePaid: number; // その他の事前立替額
}

export type RoundingUnit = 1 | 10 | 100 | 500;
export type RoundingStrategy = 'ceil' | 'round' | 'floor';

export interface CalculationSettings {
  roundingUnit: RoundingUnit;
  roundingStrategy: RoundingStrategy;
}

export interface MemberSettlement {
  memberId: string;
  name: string;
  isOwner: boolean;
  isDriver: boolean;
  baseShare: number; // 基準負担額
  discountAmount: number; // 割引額
  subtotal: number; // 割引後負担額
  roundedShare: number; // 端数丸め後負担額
  totalPaid: number; // 立替支払合計額
  netBalance: number; // 最終差引額 (正: 払いが必要, 負: 受け取り)
}

export interface PaymentTransfer {
  fromMemberId: string;
  fromName: string;
  toMemberId: string;
  toName: string;
  amount: number;
}

export interface CostBreakdown {
  fuelCost: number;
  highwayToll: number;
  parkingFee: number;
  carWashFee: number;
  rentalFee: number;
  customExpensesTotal: number;
  expensesDirectTotal: number; // 実費諸経費の合計
  maintenanceTotal: number; // 車両維持費の合計
  grandTotal: number; // 総額
  splitTargetTotal: number; // 割り勘対象総額（維持費按分後など）
  roundingAdjustment: number; // 端数丸めによる誤差調整額
}

export interface SplitResult {
  breakdown: CostBreakdown;
  members: MemberSettlement[];
  transfers: PaymentTransfer[];
  costPerKm: number; // 1kmあたり総合コスト
}

export interface SavedCarProfile {
  id: string;
  name: string;
  carType: CarTypePreset;
  fuelEfficiency: number;
  customRatePerKm: number;
}
