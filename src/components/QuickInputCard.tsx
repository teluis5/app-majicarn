import React, { useState } from 'react';
import {
  Navigation,
  Users,
  MapPin,
  Sparkles,
  Loader2,
  Wrench,
  ShieldCheck,
  Check,
  AlertCircle,
  Fuel,
  Car,
  ParkingSquare,
} from 'lucide-react';
import type { CarTypePreset, TripData } from '../types/calculator';
import { CAR_TYPE_PRESETS, getMaintenanceRatePerKm } from '../utils/calculation';
import { estimateRoute, type RouteEstimateResult } from '../utils/routeEstimator';
import { RouteMapView } from './RouteMapView';

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
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [isRoundTrip, setIsRoundTrip] = useState(true);
  const useHighway = true;
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedNotice, setCalculatedNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [routeResult, setRouteResult] = useState<RouteEstimateResult | null>(null);

  const currentCarType = trip.maintenance.carType;
  const ratePerKm = getMaintenanceRatePerKm(trip.maintenance);

  // 4大セクションのリアルタイム小計
  // 1. ガソリン代
  const fuelCost =
    trip.fuelMode === 'actual'
      ? Math.max(0, trip.actualFuelCost || 0)
      : !trip.distanceKm || !trip.fuelEfficiency
      ? 0
      : Math.round((trip.distanceKm / trip.fuelEfficiency) * (trip.fuelPricePerLiter || 0));

  // 2. 交通費 (高速・ETC料金)
  const transitCost = Math.max(0, trip.highwayToll || 0);

  // 3. 駐車場等 (駐車場代 + 洗車代)
  const parkingEtcCost = Math.max(0, trip.parkingFee || 0) + Math.max(0, trip.carWashFee || 0);

  // 4. 諸経費 (車両維持費)
  const maintenanceCost = trip.maintenance.enabled
    ? Math.round(ratePerKm * (trip.distanceKm || 0))
    : 0;

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

      setRouteResult(result);
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

  const quickPassengerCounts = [1, 2, 3, 4, 5];
  const isDriverFree = trip.driverDiscount === 'free';

  return (
    <div className="space-y-6">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          割り勘メンバー設定（最上部でシンプルに人数決定）
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="space-y-2 pb-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-600" />
            同乗者の人数（運転手を除く）
          </span>
          <span className="text-[11px] font-bold text-slate-500">
            合計 {trip.passengerCount + 1}名（運転手1名含む）
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 人数ボタングループ */}
          <div className="flex-1 grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-xl">
            {quickPassengerCounts.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onTripChange({ passengerCount: num })}
                className={`py-1.5 text-xs font-black rounded-lg transition-all ${
                  trip.passengerCount === num
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {num}人
              </button>
            ))}
          </div>

          {/* 運転手無料トグル */}
          <button
            type="button"
            onClick={() =>
              onTripChange({
                driverDiscount: isDriverFree ? 'none' : 'free',
              })
            }
            className={`px-3 py-2 text-xs font-extrabold rounded-xl border transition-all shrink-0 flex items-center gap-1 ${
              isDriverFree
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            運転手 ¥0
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          セクション 1: ⛽ ガソリン代
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="pt-4 border-t border-slate-200/90 space-y-3">
        {/* セクション見出し ＆ 小計バッジ */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-xs font-black flex items-center justify-center">
              1
            </span>
            <div className="flex items-center gap-1.5 text-sm font-black text-slate-900">
              <Fuel className="w-4 h-4 text-rose-500" />
              <span>ガソリン代</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold block leading-none">小計</span>
            <span className="text-base font-black text-rose-600">
              ¥{fuelCost.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 走行距離入力 */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-slate-400" />
              走行距離（往復・合計）
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              交通費セクションで自動算出も可能
            </span>
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
              className="w-full px-3 py-2 text-lg font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500 transition-all pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              km
            </span>
          </div>
        </div>

        {/* 燃費 ＆ ガソリン単価 */}
        {trip.fuelMode === 'calculate' ? (
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                平均燃費 (km/L)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={trip.fuelEfficiency}
                  onChange={(e) =>
                    onTripChange({
                      fuelEfficiency: Math.max(1, parseFloat(e.target.value) || 1),
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-sm font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 pr-9"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                  km/L
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                ガソリン単価 (円/L)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={trip.fuelPricePerLiter}
                  onChange={(e) =>
                    onTripChange({
                      fuelPricePerLiter: Math.max(0, parseInt(e.target.value, 10) || 0),
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-sm font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 pr-8"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                  円/L
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
              給油レシート実費 (円)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="10"
                value={trip.actualFuelCost === 0 ? '' : trip.actualFuelCost}
                onChange={(e) =>
                  onTripChange({
                    actualFuelCost: Math.max(0, parseInt(e.target.value, 10) || 0),
                  })
                }
                placeholder="4500"
                className="w-full px-2.5 py-1.5 text-sm font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 pr-7"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                円
              </span>
            </div>
          </div>
        )}

        {/* ガソリン計算モード切替リンク */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() =>
              onTripChange({
                fuelMode: trip.fuelMode === 'calculate' ? 'actual' : 'calculate',
              })
            }
            className="text-[11px] text-slate-500 hover:text-slate-800 underline font-medium"
          >
            {trip.fuelMode === 'calculate'
              ? '▶ レシートの実給油額で入力する'
              : '▶ 燃費・単価から自動計算する'}
          </button>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          セクション 2: 🛣️ 交通費（高速代・有料道路・ルート自動算出）
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="pt-4 border-t border-slate-200/90 space-y-3">
        {/* セクション見出し ＆ 小計バッジ */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">
              2
            </span>
            <div className="flex items-center gap-1.5 text-sm font-black text-slate-900">
              <Car className="w-4 h-4 text-blue-600" />
              <span>交通費（高速代・ETC）</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold block leading-none">小計</span>
            <span className="text-base font-black text-blue-600">
              ¥{transitCost.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 目的地から距離・高速代を自動算出 */}
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/70 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-700 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              目的地から自動入力
            </span>
            <span className="text-[10px] text-slate-400">距離＆高速代を即時計算</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">出発地</label>
              <input
                type="text"
                value={fromQuery}
                onChange={(e) => setFromQuery(e.target.value)}
                placeholder="例: 新宿駅"
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

          {/* 経路マップ */}
          {routeResult && (
            <RouteMapView
              fromName={routeResult.fromName}
              toName={routeResult.toName}
              fromCoords={routeResult.fromCoords}
              toCoords={routeResult.toCoords}
              routeCoordinates={routeResult.routeCoordinates}
              googleMapsUrl={routeResult.googleMapsUrl}
              isRoundTrip={routeResult.isRoundTrip}
              distanceKm={trip.distanceKm}
            />
          )}

          {/* エラー表示 */}
          {errorMsg && (
            <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-1.5 text-[11px] text-rose-700">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* 高速代入力（手動補正OK） */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>高速道路・ETC料金</span>
            <span className="text-[10px] text-slate-400 font-normal">直接入力・補正OK</span>
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
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              円
            </span>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          セクション 3: 🅿️ 駐車場等
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="pt-4 border-t border-slate-200/90 space-y-3">
        {/* セクション見出し ＆ 小計バッジ */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-black flex items-center justify-center">
              3
            </span>
            <div className="flex items-center gap-1.5 text-sm font-black text-slate-900">
              <ParkingSquare className="w-4 h-4 text-amber-600" />
              <span>駐車場等</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold block leading-none">小計</span>
            <span className="text-base font-black text-amber-600">
              ¥{parkingEtcCost.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* 駐車場代 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              駐車場代
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="100"
                value={trip.parkingFee === 0 ? '' : trip.parkingFee}
                onChange={(e) =>
                  onTripChange({
                    parkingFee: Math.max(0, parseInt(e.target.value, 10) || 0),
                  })
                }
                placeholder="0"
                className="w-full px-3 py-2 text-base font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 transition-all pr-7"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                円
              </span>
            </div>
          </div>

          {/* 洗車代 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              洗車代
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="100"
                value={trip.carWashFee === 0 ? '' : trip.carWashFee}
                onChange={(e) =>
                  onTripChange({
                    carWashFee: Math.max(0, parseInt(e.target.value, 10) || 0),
                  })
                }
                placeholder="0"
                className="w-full px-3 py-2 text-base font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 transition-all pr-7"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                円
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          セクション 4: 🛠️ 諸経費（車両維持費・走行消耗手当）★強調！
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="pt-4 border-t border-slate-200/90 space-y-3">
        {/* セクション見出し ＆ 小計バッジ（最大強調） */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center">
              4
            </span>
            <div className="flex items-center gap-1.5 text-sm font-black text-slate-900">
              <Wrench className="w-4 h-4 text-indigo-600" />
              <span>諸経費（車両維持費）</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-indigo-500 font-bold block leading-none">
              車主への公平な手当
            </span>
            <span className="text-base font-black text-indigo-700">
              ¥{maintenanceCost.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 車種選択（軽・普通・ミニバン） */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-700">
              車種（1kmあたりの消耗レート目安）
            </span>
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
                { key: 'kei', label: '軽自動車', rate: '10円/km' },
                { key: 'sedan_suv', label: '普通車', rate: '18円/km' },
                { key: 'minivan', label: 'ミニバン', rate: '22円/km' },
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
                  className={`py-2 px-1 text-center rounded-lg transition-all ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <div className="text-xs font-black">{item.label}</div>
                  <div className="text-[10px] text-slate-400 font-semibold">{item.rate}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 諸経費の納得感ハイライト（計算根拠） */}
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-2.5 flex items-center justify-between text-xs text-indigo-950">
          <div className="space-y-0.5">
            <div className="font-bold flex items-center gap-1 text-indigo-900">
              <span>タイヤ・オイル・車検等の消耗按分</span>
            </div>
            <div className="text-[11px] text-indigo-700">
              走行 {trip.distanceKm}km × ¥{ratePerKm}/km
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-black text-indigo-800">
              ¥{maintenanceCost.toLocaleString()}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
