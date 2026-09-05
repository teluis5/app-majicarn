import { describe, it, expect } from 'vitest';
import {
  calculateCostBreakdown,
  calculateFuelCost,
  calculateSimpleSplit,
  getMaintenanceRatePerKm,
  roundAmount,
} from './calculation';
import { DEFAULT_SETTINGS, DEFAULT_TRIP_DATA } from './storage';

describe('Calculation Engine (Driver + Passengers Model)', () => {
  it('calculates fuel cost correctly for calculated mode', () => {
    const trip = {
      ...DEFAULT_TRIP_DATA,
      distanceKm: 150,
      fuelEfficiency: 15,
      fuelPricePerLiter: 170,
      fuelMode: 'calculate' as const,
    };
    // 150 / 15 * 170 = 1700
    expect(calculateFuelCost(trip)).toBe(1700);
  });

  it('calculates maintenance rate from detailed settings', () => {
    const maintenance = {
      enabled: true,
      mode: 'detailed' as const,
      carType: 'compact' as const,
      customRatePerKm: 15,
      burdenSharePercent: 100,
      detailed: {
        annualMileage: 10000,
        annualInspectionCost: 50000,
        annualInsuranceCost: 50000,
        annualTaxCost: 30000,
        annualMaintenanceCost: 20000,
      },
    };
    // total 150,000 / 10,000 = 15.0
    expect(getMaintenanceRatePerKm(maintenance)).toBe(15);
  });

  it('calculates full cost breakdown properly', () => {
    const breakdown = calculateCostBreakdown({
      ...DEFAULT_TRIP_DATA,
      distanceKm: 200,
      highwayToll: 3000,
      parkingFee: 1500,
    });
    expect(breakdown.highwayToll).toBe(3000);
    expect(breakdown.parkingFee).toBe(1500);
    expect(breakdown.grandTotal).toBeGreaterThan(0);
  });

  it('calculates equal split for driver free discount', () => {
    const trip = {
      ...DEFAULT_TRIP_DATA,
      distanceKm: 100,
      fuelEfficiency: 10,
      fuelPricePerLiter: 160, // 1600円
      highwayToll: 2000,
      parkingFee: 1400,
      carWashFee: 0,
      customExpenses: [],
      passengerCount: 3, // 同乗者3人
      driverDiscount: 'free' as const, // 運転手無料
      maintenance: {
        ...DEFAULT_TRIP_DATA.maintenance,
        enabled: true,
        carType: 'kei' as const, // 10円/km * 100km = 1000円
        burdenSharePercent: 100,
      },
    };
    // Grand total: 1600 (fuel) + 2000 (highway) + 1400 (parking) + 1000 (maint) = 6000円
    // 3 passengers = 2000円 each, driver = 0円
    const result = calculateSimpleSplit(trip, { roundingUnit: 1, roundingStrategy: 'round' });
    expect(result.breakdown.grandTotal).toBe(6000);
    expect(result.passengerShare).toBe(2000);
    expect(result.driverShare).toBe(0);
    expect(result.driverFree).toBe(true);
  });

  it('calculates equal split when driver pays equal share', () => {
    const trip = {
      ...DEFAULT_TRIP_DATA,
      distanceKm: 100,
      fuelEfficiency: 10,
      fuelPricePerLiter: 160, // 1600円
      highwayToll: 2000,
      parkingFee: 400,
      carWashFee: 0,
      customExpenses: [],
      passengerCount: 3, // 同乗者3人（計4人）
      driverDiscount: 'none' as const, // 全員均等
      maintenance: {
        ...DEFAULT_TRIP_DATA.maintenance,
        enabled: false,
      },
    };
    // Grand total: 1600 + 2000 + 400 = 4000円
    // 4 people = 1000円 each
    const result = calculateSimpleSplit(trip, { roundingUnit: 1, roundingStrategy: 'round' });
    expect(result.breakdown.grandTotal).toBe(4000);
    expect(result.passengerShare).toBe(1000);
    expect(result.driverShare).toBe(1000);
  });
});
