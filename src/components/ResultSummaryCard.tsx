import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { SimpleSplitResult, TripData } from '../types/calculator';

interface ResultSummaryCardProps {
  trip: TripData;
  result: SimpleSplitResult;
}

export const ResultSummaryCard: React.FC<ResultSummaryCardProps> = ({ trip, result }) => {
  const { breakdown, passengerShare, driverShare, driverFree, passengerCount, costPerKm } = result;
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  return (
    <div className="pt-4 border-t border-slate-200/80 space-y-4">
      {/* 請求額メイン表示 & 費用総額（先に表示） */}
      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
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

        {/* 費用総額 & 内訳開閉トグルボタン */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/80">
          <div>
            <span className="text-xs font-bold text-slate-500 block leading-none">費用総額</span>
            <span className="text-xl font-black text-slate-900">
              ¥{breakdown.grandTotal.toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-white border border-blue-200/80 hover:border-blue-300 px-3 py-1.5 rounded-xl transition-all shadow-2xs"
          >
            <span>{isBreakdownOpen ? '内訳を閉じる' : '内訳を見る'}</span>
            {isBreakdownOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* アコーディオン開閉される費用内訳リスト */}
        {isBreakdownOpen && (
          <div className="pt-3 border-t border-slate-200/70 space-y-2 text-xs animate-in fade-in duration-200">
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

            {/* 2. 高速代 */}
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                2. 高速代
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

            {/* 4. 諸経費（車両維持費）- 他と同じフラットなデザイン */}
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                4. 諸経費 (車両維持費)
              </span>
              <span className="font-extrabold text-slate-900">
                ¥{breakdown.maintenanceTotal.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
