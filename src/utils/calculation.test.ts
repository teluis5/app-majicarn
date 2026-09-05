import { describe, it, expect } from 'vitest';
import {
  calculateCostBreakdown,
  calculateFuelCost,
  calculateSettlements,
  calculateSplit,
  getMaintenanceRatePerKm,
  roundAmount,
} from './calculation';
import { DEFAULT_MEMBERS, DEFAULT_TRIP_DATA } from './storage';

describe('Calculation Engine', () => {
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

  it('calculates fuel cost correctly for actual mode', () => {
    const trip = {
      ...DEFAULT_TRIP_DATA,
      fuelMode: 'actual' as const,
      actualFuelCost: 3500,
    };
    expect(calculateFuelCost(trip)).toBe(3500);
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

  it('rounds amounts correctly based on unit and strategy', () => {
    expect(roundAmount(1234, 100, 'ceil')).toBe(1300);
    expect(roundAmount(1234, 100, 'round')).toBe(1200);
    expect(roundAmount(1270, 100, 'round')).toBe(1300);
    expect(roundAmount(1234, 100, 'floor')).toBe(1200);
    expect(roundAmount(1234, 500, 'ceil')).toBe(1500);
  });

  it('calculates equal split among 3 members', () => {
    const trip = {
      ...DEFAULT_TRIP_DATA,
      distanceKm: 100,
      fuelEfficiency: 10,
      fuelPricePerLiter: 160, // 1600円
      highwayToll: 2000,
      parkingFee: 1400,
      carWashFee: 0,
      rentalFee: 0,
      customExpenses: [],
      maintenance: {
        ...DEFAULT_TRIP_DATA.maintenance,
        enabled: true,
        carType: 'kei' as const, // 10円/km * 100km = 1000円
        burdenSharePercent: 100,
      },
    };
    // Grand total: 1600 (fuel) + 2000 (highway) + 1400 (parking) + 1000 (maint) = 6000円
    // 3 people = 2000円 each
    const result = calculateSplit(trip, DEFAULT_MEMBERS, { roundingUnit: 1, roundingStrategy: 'round' });
    expect(result.breakdown.grandTotal).toBe(6000);
    expect(result.breakdown.splitTargetTotal).toBe(6000);
    expect(result.members[0].roundedShare).toBe(2000);
    expect(result.members[1].roundedShare).toBe(2000);
    expect(result.members[2].roundedShare).toBe(2000);
  });

  it('calculates settlements correctly (greedy algorithm)', () => {
    const settlements = [
      {
        memberId: '1',
        name: 'オーナー',
        isOwner: true,
        isDriver: true,
        baseShare: 2000,
        discountAmount: 0,
        subtotal: 2000,
        roundedShare: 2000,
        totalPaid: 6000,
        netBalance: -4000, // 4000円もらう側
      },
      {
        memberId: '2',
        name: 'メンバーA',
        isOwner: false,
        isDriver: false,
        baseShare: 2000,
        discountAmount: 0,
        subtotal: 2000,
        roundedShare: 2000,
        totalPaid: 0,
        netBalance: 2000, // 2000円払う側
      },
      {
        memberId: '3',
        name: 'メンバーB',
        isOwner: false,
        isDriver: false,
        baseShare: 2000,
        discountAmount: 0,
        subtotal: 2000,
        roundedShare: 2000,
        totalPaid: 0,
        netBalance: 2000, // 2000円払う側
      },
    ];

    const transfers = calculateSettlements(settlements);
    expect(transfers.length).toBe(2);
    expect(transfers.some((t) => t.fromMemberId === '2' && t.toMemberId === '1' && t.amount === 2000)).toBe(true);
    expect(transfers.some((t) => t.fromMemberId === '3' && t.toMemberId === '1' && t.amount === 2000)).toBe(true);
  });
});
