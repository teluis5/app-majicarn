import React, { useState } from 'react';
import {
  Navigation,
  MapPin,
  Sparkles,
  Loader2,
  Wrench,
  AlertCircle,
  Fuel,
  Car,
  ParkingSquare,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Info,
} from 'lucide-react';
import type { CarTypePreset, TripData } from '../types/calculator';
import {
  CAR_TYPE_PRESETS,
  getMaintenanceRatePerKm,
  calculateMaintenanceBreakdownDetails,
} from '../utils/calculation';
import {
  estimateRoute,
  getHighwayTollBreakdown,
  type RouteEstimateResult,
} from '../utils/routeEstimator';
import { RouteMapView } from './RouteMapView';
import { ResultSummaryCard } from './ResultSummaryCard';
import type { SimpleSplitResult } from '../types/calculator';

interface QuickInputCardProps {
  trip: TripData;
  splitResult?: SimpleSplitResult;
  onTripChange: (updated: Partial<TripData>) => void;
  isDestinationSet: boolean;
  onDestinationConfirmed: () => void;
  onResetDestination: () => void;
}

export const QuickInputCard: React.FC<QuickInputCardProps> = ({
  trip,
  splitResult,
  onTripChange,
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
  const [isMaintenanceDetailOpen, setIsMaintenanceDetailOpen] = useState(false);
  const [isHighwayDetailOpen, setIsHighwayDetailOpen] = useState(false);

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

  // 諸経費の詳細内訳
  const maintenanceDetails = calculateMaintenanceBreakdownDetails(
    currentCarType,
    trip.distanceKm || 0
  );

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

        {/* 初回ステップ2用の内訳確認トグル（統合版） */}
        {!isDestinationSet && (
          <div className="pt-0.5 flex justify-end">
            <button
              type="button"
              onClick={() => setIsMaintenanceDetailOpen((prev) => !prev)}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              <Info className="w-3 h-3" />
              <span>維持費とは？（内訳を確認）</span>
              {isMaintenanceDetailOpen ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>
        )}
        
        {/* 内訳詳細の表示領域（右寄せにはせず全体幅で表示） */}
        {!isDestinationSet && isMaintenanceDetailOpen && (
          <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs animate-in fade-in duration-200">
            <div className="text-[10px] font-bold text-slate-500 pb-1 border-b border-slate-200/60 flex items-center justify-between">
              <span>{CAR_TYPE_PRESETS[currentCarType]?.name} の1kmあたり内訳</span>
              <span className="text-indigo-700 font-extrabold">合計 ¥{ratePerKm}/km</span>
            </div>
            <div className="space-y-1">
              {maintenanceDetails.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-700">{item.category} ({item.description})</span>
                  <span className="font-bold text-indigo-700 shrink-0 ml-2">約¥{item.ratePerKm}/km</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-700">💡 なぜ割り勘にするの？</span><br/>
              ガソリン代だけでなく、走行に応じた車の消耗分（タイヤや車検費用など）を同乗者で負担し合うことで、車を出してくれた人が損をしない公平な割り勘になります。
            </div>
          </div>
        )}
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

        {/* 目的地決定直後にまずドカンと表示する「1人あたりの支払額と費用総額」 */}
        {isDestinationSet && splitResult && (
          <div className="pt-2">
            <ResultSummaryCard trip={trip} result={splitResult} />
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          目的地決定後に表示される4大詳細セクション（後から内訳を見る）
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

          {/* 2. 高速代 */}
          <section className="pt-4 border-t border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">
                  2
                </span>
                <div className="flex items-center gap-1.5 text-sm font-black text-slate-900">
                  <Car className="w-4 h-4 text-blue-600" />
                  <span>高速代</span>
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
                <span>高速料金（ETC標準）</span>
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

            {/* 高速代の内訳詳細トグル */}
            {(() => {
              const tollInfo = getHighwayTollBreakdown(
                trip.distanceKm,
                routeResult?.isRoundTrip ?? isRoundTrip,
                currentCarType,
                trip.highwayToll,
                routeResult
              );
              return (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setIsHighwayDetailOpen(!isHighwayDetailOpen)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 transition-colors"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>高速代の計算根拠・IC内訳を見る</span>
                    {isHighwayDetailOpen ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {isHighwayDetailOpen && (
                    <div className="mt-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-slate-700 space-y-2.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
                        <span className="font-bold text-blue-900">
                          {tollInfo.isRoundTrip ? '往復' : '片道'} 推定料金
                        </span>
                        <span className="font-black text-blue-700 text-sm">
                          ¥{tollInfo.estimatedToll.toLocaleString()}
                          {tollInfo.isRoundTrip && (
                            <span className="text-[10px] text-blue-600 font-normal ml-1">
                              (片道約 ¥{tollInfo.oneWayToll.toLocaleString()} × 2)
                            </span>
                          )}
                        </span>
                      </div>

                      {/* IC間実走行区間情報 */}
                      {(tollInfo.entryICName || tollInfo.exitICName) && (
                        <div className="p-2 bg-white/80 rounded-lg border border-blue-200/50 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-blue-950 flex items-center gap-1">
                              🛣️ 利用IC区間
                            </span>
                            {tollInfo.highwayKm > 0 && (
                              <span className="text-[11px] font-black text-blue-700">
                                実走行 約{tollInfo.highwayKm} km
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-800 font-semibold flex items-center gap-1.5 flex-wrap">
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
                              乗
                            </span>
                            <span>{tollInfo.entryICName || '最寄りIC'}</span>
                            <span className="text-slate-400">➔</span>
                            <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold text-[10px]">
                              降
                            </span>
                            <span>{tollInfo.exitICName || '最寄りIC'}</span>
                          </div>
                          {tollInfo.highwayRoadNames && tollInfo.highwayRoadNames.length > 0 && (
                            <div className="text-[10px] text-slate-500 pt-0.5">
                              経由: {tollInfo.highwayRoadNames.join('、')}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-slate-500 shrink-0">車種区分</span>
                          <span className="font-semibold text-slate-800 text-right">
                            {tollInfo.carTypeName}
                          </span>
                        </div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-slate-500 shrink-0">計算基準</span>
                          <span className="font-medium text-slate-700 text-right text-[11px]">
                            {tollInfo.formulaDescription}
                          </span>
                        </div>
                        {tollInfo.estimatedToll > 0 && (
                          <div className="pt-1 border-t border-blue-200/40 text-[11px] space-y-1 text-slate-600">
                            <div className="flex justify-between">
                              <span>🌙 深夜割引(30%OFF)目安:</span>
                              <span className="font-bold text-slate-800">
                                約 ¥{tollInfo.discountEstimateLateNight.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>🎌 休日割引(30%OFF)目安:</span>
                              <span className="font-bold text-slate-800">
                                約 ¥{tollInfo.discountEstimateHoliday.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-[10px] text-blue-800/80 bg-blue-100/50 p-2 rounded-lg leading-relaxed">
                        💡 実際のETC明細や領収書がある場合は、上の入力欄で直接補正していただけます。
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </section>

          {/* 3. 駐車場等（駐車代・洗車代を1つの入力欄に統合） */}
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>駐車・洗車代</span>
                <span className="text-[10px] text-slate-400 font-normal">コインパーキング・洗車機など</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={parkingEtcCost === 0 ? '' : parkingEtcCost}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                    onTripChange({
                      parkingFee: val,
                      carWashFee: 0,
                    });
                  }}
                  placeholder="0"
                  className="w-full px-3 py-2 text-base font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 transition-all pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  円
                </span>
              </div>
            </div>
          </section>

          {/* 4. 諸経費（車両維持費） */}
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
                <span className="text-[10px] text-slate-400 font-bold block leading-none">小計</span>
                <span className="text-base font-black text-indigo-700">
                  ¥{maintenanceCost.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-slate-800">
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

            {/* 諸経費・維持費の詳細内訳トグルボタン */}
            <button
              type="button"
              onClick={() => setIsMaintenanceDetailOpen((prev) => !prev)}
              className="w-full py-2 px-3 bg-indigo-50/90 hover:bg-indigo-100/80 border border-indigo-200/90 rounded-xl text-xs font-bold text-indigo-900 flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>維持費の詳細な内訳（タイヤ・オイル・車検等）を見る</span>
              </span>
              <span className="text-[11px] font-extrabold flex items-center gap-0.5 text-indigo-600 shrink-0">
                {isMaintenanceDetailOpen ? '内訳を閉じる' : '内訳を表示'}
                {isMaintenanceDetailOpen ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </span>
            </button>

            {/* トグル展開される詳細内訳カード */}
            {isMaintenanceDetailOpen && (
              <div className="bg-white rounded-2xl border border-indigo-200/90 p-3.5 space-y-3 shadow-xs animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="text-xs font-black text-slate-800">
                    {CAR_TYPE_PRESETS[currentCarType]?.name || '普通車'} の維持費内訳
                  </div>
                  <div className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                    合計 ¥{ratePerKm}/km
                  </div>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {maintenanceDetails.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          {item.category}
                        </div>
                        <div className="text-[10px] text-slate-400 pl-3">
                          {item.description}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-extrabold text-slate-900">
                          ¥{item.cost.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold">
                          (@¥{item.ratePerKm}/km)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs font-black text-indigo-950">
                  <span>走行 {trip.distanceKm}km 分の維持費合計</span>
                  <span className="text-base text-indigo-700 font-black">
                    ¥{maintenanceCost.toLocaleString()}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl text-[10px] text-slate-500 leading-relaxed space-y-1">
                  <p className="font-bold text-slate-700">💡 なぜ車両維持費を割り勘にするの？</p>
                  <p>
                    車は走行距離に応じてタイヤが摩耗し、エンジンオイルが劣化し、車検整備費用が発生します。
                    ガソリン代だけでなく、この走行消耗分（1kmあたり約{ratePerKm}円）を同乗者で均等に按分することで、車主（運転手）だけが損をしない公平な割り勘になります。
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
