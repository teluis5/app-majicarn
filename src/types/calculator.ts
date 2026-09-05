export type FuelCalculationMode = 'calculate' | 'actual';

export type CarTypePreset = 'kei' | 'compact' | 'sedan_suv' | 'minivan' | 'luxury' | 'custom';

export interface MaintenanceSettings {
  enabled: boolean;
  mode: 'preset' | 'detailed';
  carType: CarTypePreset;
  customRatePerKm: number; // 円/km
  burdenSharePercent: number; // 維持費の割り勘割合 (0〜100%)
  detailed: {
    annualMileage: number;
    annualInspectionCost: number;
    annualInsuranceCost: number;
    annualTaxCost: number;
    annualMaintenanceCost: number;
  };
}

export interface CustomExpense {
  id: string;
  name: string;
  amount: number;
}

export interface TripData {
  distanceKm: number; // 走行距離
  fuelMode: FuelCalculationMode;
  fuelEfficiency: number; // 燃費 (km/L)
  fuelPricePerLiter: number; // ガソリン単価 (円/L)
  actualFuelCost: number; // 実費給油額 (円)
  highwayToll: number; // 高速道路・ETC料金
  parkingFee: number; // 駐車場代
  carWashFee: number; // 洗車代
  customExpenses: CustomExpense[];
  maintenance: MaintenanceSettings;
  passengerCount: number; // 同乗者の人数 (1〜)
  driverDiscount: 'none' | 'free' | 'half'; // 運転手優遇
  driverName: string; // 運転手の表示名 (デフォルト "運転手")
  passengerAdvancePaid: number; // 同乗者が立て替えた合計額 (任意)
}

export type RoundingUnit = 1 | 10 | 100 | 500;
export type RoundingStrategy = 'ceil' | 'round' | 'floor';

export interface CalculationSettings {
  roundingUnit: RoundingUnit;
  roundingStrategy: RoundingStrategy;
}

export interface CostBreakdown {
  fuelCost: number;
  highwayToll: number;
  transitTotal: number; // 交通費小計 (高速・ETCなど)
  parkingFee: number;
  carWashFee: number;
  customExpensesTotal: number;
  parkingEtcTotal: number; // 駐車場等小計 (駐車場+洗車+スポット)
  expensesDirectTotal: number; // 直接諸経費合計
  maintenanceTotal: number; // 諸経費・車両維持費合計
  grandTotal: number; // 全体費用総額
  splitTargetTotal: number; // 割り勘対象総額
  roundingAdjustment: number; // 端数調整額
}

export interface SimpleSplitResult {
  breakdown: CostBreakdown;
  passengerCount: number;
  totalPeopleCount: number; // 運転手 + 同乗者
  costPerKm: number;
  passengerShare: number; // 同乗者1人あたり (丸め後)
  rawPassengerShare: number; // 丸め前
  driverShare: number; // 運転手の自己負担額
  driverFree: boolean;
  totalCollected: number; // 同乗者全員からの回収予定総額
}

export interface SavedCarProfile {
  id: string;
  name: string;
  carType: CarTypePreset;
  fuelEfficiency: number;
  customRatePerKm: number;
}
