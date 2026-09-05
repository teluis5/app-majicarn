import React, { useState } from 'react';
import { Navigation, Users, MapPin, Sparkles, Loader2, Wrench, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import type { CarTypePreset, TripData } from '../types/calculator';
import { CAR_TYPE_PRESETS, getMaintenanceRatePerKm } from '../utils/calculation';
import { estimateRoute, POPULAR_ROUTES } from '../utils/routeEstimator';

interface QuickInputCardProps {
  trip: TripData;
  onTripChange: (updated: Partial<TripData>) => void;
  onOpenHelp: () => void;
}

export const QuickInputCard: React.FC<QuickInputCardProps> = ({
  trip,
  onTripChange,
  onOpenHelp,
}) => {
  const [fromQuery, setFromQuery] = useState('東京駅');
  const [toQuery, setToQuery] = useState('箱根湯本');
  const [isRoundTrip, setIsRoundTrip] = useState(true);
  const useHighway = true;
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedNotice, setCalculatedNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentCarType = trip.maintenance.carType;
  const ratePerKm = getMaintenanceRatePerKm(trip.maintenance);
  const maintenanceCost = Math.round(ratePerKm * (trip.distanceKm || 0));

  const handleSelectCarType = (type: CarTypePreset) => {
    const preset = CAR_TYPE_PRESETS[type];
    onTripChange({
      fuelEfficiency: preset.defaultFuelEfficiency,
      maintenance: {
        ...trip.maintenance,
        enabled: true,
        carType: type,
        customRatePerKm: preset.ratePerKm,
      },
    });
  };

  const handleCalculateRoute = async () => {
    if (!fromQuery.trim() || !toQuery.trim()) {
      setErrorMsg('出発地と目的地を入力してください');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setCalculatedNotice(null);

    try {
      const result = await estimateRoute(
        fromQuery.trim(),
        toQuery.trim(),
        isRoundTrip,
        useHighway,
        currentCarType
      );

      // 距離と高速代を入力フォームへ即座に反映！
      onTripChange({
        distanceKm: result.totalDistanceKm,
        highwayToll: result.totalToll,
      });

      setCalculatedNotice(
        `${result.fromName} ⇄ ${result.toName} (${isRoundTrip ? '往復' : '片道'}) の距離と高速代を反映しました`
      );
    } catch (e: unknown) {
      const err = e as Error;
      setErrorMsg(err.message || 'ルートの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPopularRoute = (r: { from: string; to: string }) => {
    setFromQuery(r.from);
    setToQuery(r.to);
    setErrorMsg(null);
    setCalculatedNotice(null);
  };

  const quickPassengerCounts = [1, 2, 3, 4, 5];
  const quickDistances = [50, 100, 150, 200, 300];
  const isDriverFree = trip.driverDiscount === 'free';

  return (
    <div className="space-y-4">
      {/* 📍 出発地・目的地からの自動ルート算出エリア（Home画面に常時配置） */}
      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>目的地から距離・高速代を自動算出</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            下枠で手動補正OK
          </span>
        </div>

        {/* 定番人気ルートチップ */}
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_ROUTES.slice(0, 4).map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectPopularRoute(r)}
              className={`text-[11px] px-2.5 py-0.5 rounded-lg border font-medium transition-colors ${
                fromQuery === r.from && toQuery === r.to
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* 出発地 & 目的地入力欄 */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
              出発地
            </label>
            <input
              type="text"
              value={fromQuery}
              onChange={(e) => setFromQuery(e.target.value)}
              placeholder="例: 東京駅"
              className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
              目的地 / 到着地
            </label>
            <input
              type="text"
              value={toQuery}
              onChange={(e) => setToQuery(e.target.value)}
              placeholder="例: 箱根湯本"
              className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* 往復/片道 & 自動計算ボタン */}
        <div className="flex items-center gap-2">
          <div className="flex bg-white p-0.5 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setIsRoundTrip(true)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                isRoundTrip
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              往復 (×2)
            </button>
            <button
              type="button"
              onClick={() => setIsRoundTrip(false)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                !isRoundTrip
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              片道
            </button>
          </div>

          <button
            type="button"
            disabled={isLoading || !fromQuery.trim() || !toQuery.trim()}
            onClick={handleCalculateRoute}
            className="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 active:scale-[0.98] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 shadow-xs transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>計算中...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>距離と高速代を反映</span>
              </>
            )}
          </button>
        </div>

        {/* 通知バッジ */}
        {calculatedNotice && (
          <div className="p-2 bg-emerald-100/70 border border-emerald-200 rounded-xl flex items-center gap-1.5 text-[11px] text-emerald-900 font-bold">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{calculatedNotice}</span>
          </div>
        )}

        {/* エラー表示 */}
        {errorMsg && (
          <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-1.5 text-[11px] text-rose-700">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* 1. 車種セグメントコントロール */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-slate-700">車種</span>
          <button
            type="button"
            onClick={onOpenHelp}
            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5"
          >
            <ShieldCheck className="w-3 h-3" />
            維持費とは？
          </button>
        </div>

        <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-3 gap-1">
          {(
            [
              { key: 'kei', label: '軽自動車' },
              { key: 'sedan_suv', label: '普通車' },
              { key: 'minivan', label: 'ミニバン' },
            ] as const
          ).map((item) => {
            const isSelected =
              currentCarType === item.key ||
              (item.key === 'sedan_suv' && currentCarType === 'compact');
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleSelectCarType(item.key)}
                className={`py-2 text-xs font-black rounded-lg transition-all ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. 走行距離 & 高速代（手動でいつでも自由に補正可能） */}
      <div className="grid grid-cols-2 gap-3">
        {/* 走行距離 */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Navigation className="w-3 h-3 text-slate-400" />
              走行距離
            </span>
            <span className="text-[10px] text-slate-400 font-normal">補正OK</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="1"
              value={trip.distanceKm === 0 ? '' : trip.distanceKm}
              onChange={(e) =>
                onTripChange({ distanceKm: Math.max(0, parseFloat(e.target.value) || 0) })
              }
              placeholder="150"
              className="w-full px-3 py-2 text-lg font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all pr-8"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              km
            </span>
          </div>
          <div className="flex gap-1 mt-1">
            {quickDistances.map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => onTripChange({ distanceKm: km })}
                className={`flex-1 py-0.5 text-[10px] rounded font-bold border transition-all ${
                  trip.distanceKm === km
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {km}
              </button>
            ))}
          </div>
        </div>

        {/* 高速代 */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>高速・ETC代</span>
            <span className="text-[10px] text-slate-400 font-normal">補正OK</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="50"
              value={trip.highwayToll === 0 ? '' : trip.highwayToll}
              onChange={(e) =>
                onTripChange({ highwayToll: Math.max(0, parseInt(e.target.value, 10) || 0) })
              }
              placeholder="0"
              className="w-full px-3 py-2 text-lg font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all pr-8"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              円
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            ※ETC明細に合わせて微調整可能
          </p>
        </div>
      </div>

      {/* 🌟 本アプリのコア価値：諸経費（車両維持費）の強調表示！ */}
      <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Wrench className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
              車両維持費（走行消耗手当）
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-indigo-200/60 text-indigo-900 rounded">
                MajiCarn独自
              </span>
            </div>
            <div className="text-[10px] text-indigo-800/80">
              車検・保険・タイヤ等の消耗按分: ¥{ratePerKm}/km
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-sm font-black text-indigo-900">
            ¥{maintenanceCost.toLocaleString()}
          </div>
          <div className="text-[9px] text-indigo-600 font-bold">
            車主へ加算
          </div>
        </div>
      </div>

      {/* 3. 同乗者の人数 */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3 text-slate-400" />
            同乗者の人数（あなた以外の乗客）
          </span>
          <span className="text-xs font-bold text-blue-600">
            {trip.passengerCount}人 (計{1 + trip.passengerCount}人)
          </span>
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {quickPassengerCounts.map((count) => {
            const isSelected = trip.passengerCount === count;
            return (
              <button
                key={count}
                type="button"
                onClick={() => onTripChange({ passengerCount: count })}
                className={`py-2 rounded-xl font-black text-sm transition-all border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {count}人
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. 運転手無料トグル */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-800 block">
            運転手（あなた）は無料にする
          </span>
          <span className="text-[10px] text-slate-400">
            長時間の運転お疲れ様！同乗者のみで割り勘
          </span>
        </div>

        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isDriverFree}
            onChange={(e) =>
              onTripChange({ driverDiscount: e.target.checked ? 'free' : 'none' })
            }
            className="sr-only peer"
          />
          <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  );
};
