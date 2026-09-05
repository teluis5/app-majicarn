import React from 'react';
import type { SimpleSplitResult, TripData } from '../types/calculator';

interface ResultSummaryCardProps {
  trip: TripData;
  result: SimpleSplitResult;
}

export const ResultSummaryCard: React.FC<ResultSummaryCardProps> = ({ trip, result }) => {
  const { breakdown, passengerShare, driverShare, driverFree, passengerCount, costPerKm } = result;

  const total = Math.max(1, breakdown.grandTotal);
  const fuelPct = Math.round((breakdown.fuelCost / total) * 100);
  const directPct = Math.round((breakdown.expensesDirectTotal / total) * 100);
  const maintPct = Math.round((breakdown.maintenanceTotal / total) * 100);

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* メインの金額表示 */}
      <div>
        <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
          <span>同乗者 1人あたりの支払額</span>
          <span className="text-[10px] text-slate-400">
            {trip.distanceKm}km / 約¥{costPerKm}/km
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            ¥{passengerShare.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 font-bold">/ 1人</span>
        </div>

        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
          {driverFree ? (
            <span className="text-emerald-400 font-bold">
              ※運転手は ¥0（お疲れ様割）
            </span>
          ) : (
            <span>運転手負担: ¥{driverShare.toLocaleString()}</span>
          )}
          <span>・</span>
          <span>同乗者{passengerCount}名で回収</span>
        </div>
      </div>

      {/* 内訳ミニバー */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>費用総額: ¥{breakdown.grandTotal.toLocaleString()}</span>
        </div>

        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <div style={{ width: `${fuelPct}%` }} className="bg-rose-500" />
          <div style={{ width: `${directPct}%` }} className="bg-emerald-500" />
          <div style={{ width: `${maintPct}%` }} className="bg-indigo-500" />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            ガソリン ¥{breakdown.fuelCost.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            高速等 ¥{breakdown.expensesDirectTotal.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            維持費 ¥{breakdown.maintenanceTotal.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
