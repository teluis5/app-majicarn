import type { CalculationSettings, Member, SavedCarProfile, TripData } from '../types/calculator';

const STORAGE_KEYS = {
  CAR_PROFILES: 'majicarn_car_profiles_v1',
  SELECTED_CAR_ID: 'majicarn_selected_car_id_v1',
  MEMBERS: 'majicarn_members_v1',
  CALC_SETTINGS: 'majicarn_calc_settings_v1',
  LAST_TRIP: 'majicarn_last_trip_v1',
};

export const DEFAULT_TRIP_DATA: TripData = {
  distanceKm: 120,
  fuelMode: 'calculate',
  fuelEfficiency: 15.0,
  fuelPricePerLiter: 175,
  actualFuelCost: 0,
  highwayToll: 2400,
  highwayPaidBy: 'owner',
  parkingFee: 1000,
  parkingPaidBy: 'owner',
  carWashFee: 0,
  carWashPaidBy: 'owner',
  rentalFee: 0,
  rentalPaidBy: 'owner',
  customExpenses: [],
  maintenance: {
    enabled: true,
    mode: 'preset',
    carType: 'compact',
    customRatePerKm: 15,
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

export const DEFAULT_MEMBERS: Member[] = [
  {
    id: 'owner',
    name: 'オーナー (運転)',
    isOwner: true,
    isDriver: true,
    discountType: 'none',
    discountValue: 0,
    extraAdvancePaid: 0,
  },
  {
    id: 'member_2',
    name: 'メンバーA',
    isOwner: false,
    isDriver: false,
    discountType: 'none',
    discountValue: 0,
    extraAdvancePaid: 0,
  },
  {
    id: 'member_3',
    name: 'メンバーB',
    isOwner: false,
    isDriver: false,
    discountType: 'none',
    discountValue: 0,
    extraAdvancePaid: 0,
  },
];

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

export function loadMembers(): Member[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (!raw) return DEFAULT_MEMBERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_MEMBERS;
  } catch {
    return DEFAULT_MEMBERS;
  }
}

export function saveMembers(members: Member[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  } catch (e) {
    console.error('Failed to save members', e);
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
