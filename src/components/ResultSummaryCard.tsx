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
    <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
      {/* 背景のグロー演出 */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* トップ行: 同乗者1人あたりの請求額を巨大表示 */}
      <div className="border-b border-slate-800 pb-5 mb-5">
        <span className="text-xs font-bold text-blue-400 tracking-wider uppercase flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          同乗者 1人あたりの支払額
        </span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            ¥{passengerShare.toLocaleString()}
          </span>
          <span className="text-xs font-bold text-slate-400">/ 1人</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          {driverFree ? (
            <span className="text-[11px] font-bold px-2.5 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 rounded-full">
              🎉 運転手は ¥0（お疲れ様割）
            </span>
          ) : (
            <span className="text-[11px] font-bold px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded-full">
              運転手負担: ¥{driverShare.toLocaleString()}
            </span>
          )}
          <span className="text-[11px] text-slate-400">
            （同乗者 {passengerCount}名から合計 ¥{result.totalCollected.toLocaleString()} 回収）
          </span>
        </div>
      </div>

      {/* 内訳ビジュアルバー */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
          <span>費用総額: ¥{breakdown.grandTotal.toLocaleString()}</span>
          <span className="text-slate-400 font-normal">
            総走行 {trip.distanceKm}km (約 ¥{costPerKm}/km)
          </span>
        </div>

        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${fuelPct}%` }}
            className="bg-rose-500 transition-all duration-500"
            title={`ガソリン代: ¥${breakdown.fuelCost.toLocaleString()} (${fuelPct}%)`}
          />
          <div
            style={{ width: `${directPct}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`諸経費: ¥${breakdown.expensesDirectTotal.toLocaleString()} (${directPct}%)`}
          />
          <div
            style={{ width: `${maintPct}%` }}
            className="bg-indigo-500 transition-all duration-500"
            title={`車両維持費: ¥${breakdown.maintenanceTotal.toLocaleString()} (${maintPct}%)`}
          />
        </div>

        {/* 凡例バッジ */}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-300">ガソリン:</span>
            <span className="font-bold text-white">¥{breakdown.fuelCost.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">高速・諸経費:</span>
            <span className="font-bold text-white">
              ¥{breakdown.expensesDirectTotal.toLocaleString()}
            </span>
          </div>
          {breakdown.maintenanceTotal > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="text-slate-300">車両維持費:</span>
              <span className="font-bold text-indigo-300">
                ¥{breakdown.maintenanceTotal.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
