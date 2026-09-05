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

      {/* 費用内訳リスト（諸経費・維持費の価値をしっかり可視化） */}
      <div className="bg-slate-50 rounded-2xl p-3.5 space-y-2 border border-slate-100">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-1.5 border-b border-slate-200/60">
          <span>費用総額</span>
          <span className="text-sm font-black text-slate-900">
            ¥{breakdown.grandTotal.toLocaleString()}
          </span>
        </div>

        <div className="space-y-1.5 text-xs">
          {/* ガソリン代 */}
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              ガソリン代
            </span>
            <span className="font-bold text-slate-900">
              ¥{breakdown.fuelCost.toLocaleString()}
            </span>
          </div>

          {/* 高速代・駐車場代等 */}
          {breakdown.expensesDirectTotal > 0 && (
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                高速・ETC代など諸経費
              </span>
              <span className="font-bold text-slate-900">
                ¥{breakdown.expensesDirectTotal.toLocaleString()}
              </span>
            </div>
          )}

          {/* 🌟 車両維持費（ここを一番分かりやすく強調） */}
          {breakdown.maintenanceTotal > 0 && (
            <div className="flex items-center justify-between text-indigo-900 font-bold bg-indigo-100/50 -mx-1.5 px-1.5 py-1 rounded-lg">
              <span className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                車両維持費 (車検・保険・タイヤ消耗等)
              </span>
              <span className="font-black text-indigo-700">
                ¥{breakdown.maintenanceTotal.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
