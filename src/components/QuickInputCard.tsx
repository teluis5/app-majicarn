import React, { useState } from 'react';
import {
  Navigation,
  MapPin,
  Sparkles,
  Loader2,
  Wrench,
  ShieldCheck,
  AlertCircle,
  Fuel,
  Car,
  ParkingSquare,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import type { CarTypePreset, TripData } from '../types/calculator';
import { CAR_TYPE_PRESETS, getMaintenanceRatePerKm } from '../utils/calculation';
import { estimateRoute, type RouteEstimateResult } from '../utils/routeEstimator';
import { RouteMapView } from './RouteMapView';

interface QuickInputCardProps {
  trip: TripData;
  onTripChange: (updated: Partial<TripData>) => void;
  onOpenHelp: () => void;
  isDestinationSet: boolean;
  onDestinationConfirmed: () => void;
  onResetDestination: () => void;
}

export const QuickInputCard: React.FC<QuickInputCardProps> = ({
  trip,
  onTripChange,
  onOpenHelp,
  isDestinationSet,
  onDestinationConfirmed,
  onResetDestination,
}) => {
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [isRoundTrip, setIsRoundTrip] = useState(true);
  const useHighway = true;
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [routeResult, setRouteResult] = useState<RouteEstimateResult | null>(null);
  const [isRouteSectionCollapsed, setIsRouteSectionCollapsed] = useState(false);

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

    try {
      const result = await estimateRoute(
        fromQuery.trim(),
        toQuery.trim(),
        isRoundTrip,
        useHighway,
        currentCarType
      );

      // 距離と高速代を入力フォームへ反映
      onTripChange({
        distanceKm: result.totalDistanceKm,
        highwayToll: result.totalToll,
      });

      setRouteResult(result);
      onDestinationConfirmed();
    } catch (e: unknown) {
      const err = e as Error;
      setErrorMsg(err.message || 'ルートの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSkip = () => {
    // 目的地検索をスキップして直接入力に進む
    if (!trip.distanceKm || trip.distanceKm <= 0) {
      onTripChange({ distanceKm: 100 });
    }
    onDestinationConfirmed();
  };

  const quickPassengerCounts = [1, 2, 3, 4, 5];
  const isDriverFree = trip.driverDiscount === 'free';

  return (
    <div className="space-y-5">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ステップ 1: 人数の選択
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
              1
            </span>
            <span>同乗者の人数（運転手を除く）</span>
          </span>
          <span className="text-[11px] font-bold text-slate-500">
            合計 {trip.passengerCount + 1}名（運転手含む）
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
                className={`py-2 text-xs font-black rounded-lg transition-all ${
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
          ステップ 2: 車種の選択
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
              2
            </span>
            <span>車種（維持費レート）</span>
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

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ステップ 3: 目的地の入力（最初に入力する重要項目）
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/90 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
              3
            </span>
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>目的地の入力</span>
          </span>

          {isDestinationSet && (
            <button
              type="button"
              onClick={() => setIsRouteSectionCollapsed((prev) => !prev)}
              className="text-[11px] font-bold text-blue-600 flex items-center gap-0.5 hover:underline"
            >
              {isRouteSectionCollapsed ? '入力枠を表示' : '入力枠をたたむ'}
              {isRouteSectionCollapsed ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* 目的地決定済みのときのコンパクトサマリー */}
        {isDestinationSet && routeResult && isRouteSectionCollapsed && (
          <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>{routeResult.fromName}</span>
              <span className="text-slate-400">⇄</span>
              <span>{routeResult.toName}</span>
              <span className="text-[10px] font-normal text-slate-500">
                ({routeResult.isRoundTrip ? '往復' : '片道'} {trip.distanceKm}km)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsRouteSectionCollapsed(false)}
              className="text-[11px] font-bold text-blue-600 hover:underline"
            >
              再検索
            </button>
          </div>
        )}

        {/* 出発地・目的地入力フォーム */}
        {(!isDestinationSet || !isRouteSectionCollapsed) && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                  出発地
                </label>
                <input
                  type="text"
                  value={fromQuery}
                  onChange={(e) => setFromQuery(e.target.value)}
                  placeholder="例: 新宿駅"
                  className="w-full px-2.5 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
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
                  className="w-full px-2.5 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-white p-0.5 rounded-xl border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsRoundTrip(true)}
                  className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
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
                  className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
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
                className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ルート計算中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>目的地を決定して計算</span>
                  </>
                )}
              </button>
            </div>

            {/* エラー表示 */}
            {errorMsg && (
              <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-1.5 text-[11px] text-rose-700">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 手動スキップ案内 */}
            {!isDestinationSet && (
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={handleManualSkip}
                  className="text-[11px] text-slate-400 hover:text-slate-700 underline font-medium"
                >
                  目的地を決めずに、直接距離を入力して進める ➔
                </button>
              </div>
            )}
          </div>
        )}

        {/* 経路マップ（目的地決定後にインライン展開） */}
        {isDestinationSet && routeResult && (
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
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          目的地決定後に表示される4大詳細セクション
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {isDestinationSet && (
        <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              費用内訳（後から手動補正OK）
            </span>
            <button
              type="button"
              onClick={onResetDestination}
              className="text-[11px] text-slate-400 hover:text-rose-600 font-bold flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              最初からやり直す
            </button>
          </div>

          {/* 1. ガソリン代 */}
          <section className="space-y-3">
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
                  走行距離（合計）
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
                  className="w-full px-3 py-2 text-lg font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500 transition-all pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  km
                </span>
              </div>
            </div>

            {/* 燃費 & 単価 */}
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

          {/* 2. 交通費 */}
          <section className="pt-4 border-t border-slate-200/90 space-y-3">
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

          {/* 3. 駐車場等 */}
          <section className="pt-4 border-t border-slate-200/90 space-y-3">
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

          {/* 4. 諸経費（車両維持費）★強調 */}
          <section className="pt-4 border-t border-slate-200/90 space-y-3">
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
      )}
    </div>
  );
};
