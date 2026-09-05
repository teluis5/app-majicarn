import type { CalculationSettings, SavedCarProfile, TripData } from '../types/calculator';

const STORAGE_KEYS = {
  CAR_PROFILES: 'majicarn_car_profiles_v2',
  CALC_SETTINGS: 'majicarn_calc_settings_v2',
  LAST_TRIP: 'majicarn_last_trip_v2',
};

export const DEFAULT_TRIP_DATA: TripData = {
  distanceKm: 150,
  fuelMode: 'calculate',
  fuelEfficiency: 13.0,
  fuelPricePerLiter: 175,
  actualFuelCost: 0,
  highwayToll: 2400,
  parkingFee: 0,
  carWashFee: 0,
  customExpenses: [],
  passengerCount: 3,
  driverDiscount: 'free', // デフォルトでお疲れ様割ON
  driverName: '運転手',
  passengerAdvancePaid: 0,
  maintenance: {
    enabled: true,
    mode: 'preset',
    carType: 'sedan_suv',
    customRatePerKm: 18,
    burdenSharePercent: 100,
    detailed: {
      annualMileage: 8000,
      annualInspectionCost: 50000,
      annualInsuranceCost: 65000,
      annualTaxCost: 34500,
      annualMaintenanceCost: 30000,
    },
  },
};

export const DEFAULT_SETTINGS: CalculationSettings = {
  roundingUnit: 100,
  roundingStrategy: 'ceil',
};

export function loadSavedCarProfiles(): SavedCarProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CAR_PROFILES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCarProfiles(profiles: SavedCarProfile[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CAR_PROFILES, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save car profiles', e);
  }
}

export function loadTripData(): TripData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_TRIP);
    if (!raw) return DEFAULT_TRIP_DATA;
    return { ...DEFAULT_TRIP_DATA, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_TRIP_DATA;
  }
}

export function saveTripData(trip: TripData) {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_TRIP, JSON.stringify(trip));
  } catch (e) {
    console.error('Failed to save trip data', e);
  }
}

export function loadSettings(): CalculationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CALC_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: CalculationSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.CALC_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}
