import React from 'react';
import type { SplitResult, TripData } from '../types/calculator';

interface ResultSummaryCardProps {
  trip: TripData;
  result: SplitResult;
}

export const ResultSummaryCard: React.FC<ResultSummaryCardProps> = ({ trip, result }) => {
  const { breakdown, members, costPerKm } = result;

  // 1人あたり目安（無料のメンバーを除く平均、または標準負担額）
  const payingMembers = members.filter((m) => m.roundedShare > 0);
  const avgShare =
    payingMembers.length > 0
      ? Math.round(payingMembers.reduce((s, m) => s + m.roundedShare, 0) / payingMembers.length)
      : 0;

  // 内訳のパーセンテージバー計算
  const total = Math.max(1, breakdown.grandTotal);
  const fuelPct = Math.round((breakdown.fuelCost / total) * 100);
  const directPct = Math.round((breakdown.expensesDirectTotal / total) * 100);
  const maintPct = Math.round((breakdown.maintenanceTotal / total) * 100);

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
      {/* グロー背景 */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* トップ行 */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-5">
        <div>
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
            精算サマリー
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl font-black tracking-tight text-white">
              ¥{avgShare.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400">/ 1人あたり目安</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400">総走行距離: {trip.distanceKm} km</div>
          <div className="text-xs font-bold text-blue-400 mt-0.5">
            総コスト: 約 ¥{costPerKm} /km
          </div>
        </div>
      </div>

      {/* 内訳ビジュアルバー */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
          <span>費用総額: ¥{breakdown.grandTotal.toLocaleString()}</span>
          {breakdown.roundingAdjustment !== 0 && (
            <span className="text-[11px] text-amber-300">
              端数調整: {breakdown.roundingAdjustment > 0 ? '+' : ''}
              {breakdown.roundingAdjustment}円
            </span>
          )}
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
            <span className="text-slate-300">諸経費:</span>
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

      {/* 各自の支払額グリッド */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400">メンバー別 確定負担額</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {members.map((m) => (
            <div
              key={m.memberId}
              className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-xs text-white flex items-center gap-1">
                  {m.name}
                  {m.isOwner && (
                    <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded">
                      車主
                    </span>
                  )}
                  {m.isDriver && (
                    <span className="text-[10px] text-blue-400 bg-blue-950/60 px-1.5 py-0.2 rounded">
                      運転手
                    </span>
                  )}
                </div>
                {m.discountAmount > 0 && (
                  <div className="text-[10px] text-emerald-400">
                    優遇割: -¥{m.discountAmount.toLocaleString()}
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className="text-base font-extrabold text-white">
                  ¥{m.roundedShare.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
