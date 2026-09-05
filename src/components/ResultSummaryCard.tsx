import React from 'react';
import { Wrench } from 'lucide-react';
import type { SimpleSplitResult, TripData } from '../types/calculator';

interface ResultSummaryCardProps {
  trip: TripData;
  result: SimpleSplitResult;
}

export const ResultSummaryCard: React.FC<ResultSummaryCardProps> = ({ trip, result }) => {
  const { breakdown, passengerShare, driverShare, driverFree, passengerCount, costPerKm } = result;

  return (
    <div className="pt-4 border-t border-slate-200/80 space-y-4">
      {/* 請求額メイン表示 */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <span>同乗者 1人あたりの支払額</span>
            <span className="text-[10px] text-slate-400">
              (走行 {trip.distanceKm}km / 約¥{costPerKm}/km)
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
              ¥{passengerShare.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-bold">/ 1人</span>
          </div>
        </div>

        <div className="text-right">
          {driverFree ? (
            <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg inline-block">
              🎉 運転手 ¥0
            </span>
          ) : (
            <span className="text-xs font-bold text-slate-600">
              運転手: ¥{driverShare.toLocaleString()}
            </span>
          )}
          <div className="text-[10px] text-slate-400 mt-1">
            同乗者{passengerCount}名で回収
          </div>
        </div>
      </div>

      {/* 費用内訳リスト（4大セクションに完全対応） */}
      <div className="bg-slate-50 rounded-2xl p-3.5 space-y-2.5 border border-slate-200/80">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-1.5 border-b border-slate-200/70">
          <span>費用総額</span>
          <span className="text-base font-black text-slate-900">
            ¥{breakdown.grandTotal.toLocaleString()}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          {/* 1. ガソリン代 */}
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              1. ガソリン代
            </span>
            <span className="font-extrabold text-slate-900">
              ¥{breakdown.fuelCost.toLocaleString()}
            </span>
          </div>

          {/* 2. 交通費（高速代） */}
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              2. 交通費 (高速代・ETC)
            </span>
            <span className="font-extrabold text-slate-900">
              ¥{breakdown.transitTotal.toLocaleString()}
            </span>
          </div>

          {/* 3. 駐車場等 */}
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              3. 駐車場等 (駐車・洗車)
            </span>
            <span className="font-extrabold text-slate-900">
              ¥{breakdown.parkingEtcTotal.toLocaleString()}
            </span>
          </div>

          {/* 4. 諸経費（車両維持費・走行消耗手当）★強調 */}
          <div className="flex items-center justify-between text-indigo-950 font-bold bg-indigo-100/60 -mx-1.5 px-2 py-1.5 rounded-xl border border-indigo-200/50">
            <span className="flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>4. 諸経費 (車両維持費)</span>
            </span>
            <span className="font-black text-indigo-700 text-sm">
              ¥{breakdown.maintenanceTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
