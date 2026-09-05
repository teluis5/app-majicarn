import React, { useState } from 'react';
import { X, MapPin, Navigation, Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react';
import type { CarTypePreset } from '../types/calculator';
import { estimateRoute, POPULAR_ROUTES, type RouteEstimateResult } from '../utils/routeEstimator';

interface RouteSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRoute: (distanceKm: number, highwayToll: number, label: string) => void;
  carType: CarTypePreset;
}

export const RouteSearchModal: React.FC<RouteSearchModalProps> = ({
  isOpen,
  onClose,
  onApplyRoute,
  carType,
}) => {
  const [fromQuery, setFromQuery] = useState('東京駅');
  const [toQuery, setToQuery] = useState('箱根湯本');
  const [isRoundTrip, setIsRoundTrip] = useState(true);
  const [useHighway, setUseHighway] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [estimate, setEstimate] = useState<RouteEstimateResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async () => {
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
        carType
      );
      setEstimate(result);
    } catch (e: unknown) {
      const err = e as Error;
      setErrorMsg(err.message || 'ルート計算中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPopularRoute = (route: { from: string; to: string }) => {
    setFromQuery(route.from);
    setToQuery(route.to);
    setEstimate(null);
  };

  const handleApply = () => {
    if (!estimate) return;
    const label = `${estimate.fromName} ➔ ${estimate.toName} (${estimate.isRoundTrip ? '往復' : '片道'})`;
    onApplyRoute(estimate.totalDistanceKm, estimate.totalToll, label);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-2xl">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                目的地から距離・高速代を自動算出
              </h2>
              <p className="text-xs text-slate-500">
                出発地・目的地を入れるだけで距離とETC代を自動推定
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* コンテンツエリア */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* 定番人気ルートチップ */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
              定番ドライブルートから選ぶ
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_ROUTES.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectPopularRoute(r)}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-xl transition-colors border border-slate-200/60"
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* 出発地 & 目的地入力 */}
          <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            {/* 出発地 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                出発地 (自宅・駅など)
              </label>
              <input
                type="text"
                value={fromQuery}
                onChange={(e) => setFromQuery(e.target.value)}
                placeholder="例: 新宿駅, 東京駅, 横浜市など"
                className="w-full px-3.5 py-2 text-sm font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* 目的地 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                目的地 / 到着地 (観光地・ホテルなど)
              </label>
              <input
                type="text"
                value={toQuery}
                onChange={(e) => setToQuery(e.target.value)}
                placeholder="例: 箱根湯本, 草津温泉, 日光東照宮など"
                className="w-full px-3.5 py-2 text-sm font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* オプション: 往復/片道 & 高速利用 */}
          <div className="grid grid-cols-2 gap-3">
            {/* 往復 / 片道 */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                移動タイプ
              </label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsRoundTrip(true)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    isRoundTrip
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🔁 往復 (×2)
                </button>
                <button
                  type="button"
                  onClick={() => setIsRoundTrip(false)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    !isRoundTrip
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ➡️ 片道
                </button>
              </div>
            </div>

            {/* 高速道路 */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                有料・高速道路
              </label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setUseHighway(true)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    useHighway
                      ? 'bg-white text-emerald-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🛣️ 利用する
                </button>
                <button
                  type="button"
                  onClick={() => setUseHighway(false)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    !useHighway
                      ? 'bg-white text-slate-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  下道のみ
                </button>
              </div>
            </div>
          </div>

          {/* 検索実行ボタン */}
          <button
            type="button"
            disabled={isLoading || !fromQuery.trim() || !toQuery.trim()}
            onClick={handleSearch}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>ルートと高速代を算出中...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>距離・高速代を自動計算</span>
              </>
            )}
          </button>

          {/* エラー表示 */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 算出結果プレビュー */}
          {estimate && (
            <div className="p-4 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-blue-50 border border-emerald-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-600" />
                  算出完了
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  {estimate.isRoundTrip ? '往復合計' : '片道'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-white/90 p-3 rounded-xl border border-emerald-100">
                  <div className="text-[11px] text-slate-500 font-medium">推定走行距離</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">
                    {estimate.totalDistanceKm}
                    <span className="text-xs font-bold text-slate-500 ml-1">km</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    (片道 約{estimate.oneWayDistanceKm}km)
                  </div>
                </div>

                <div className="bg-white/90 p-3 rounded-xl border border-emerald-100">
                  <div className="text-[11px] text-slate-500 font-medium">高速・ETC料金目安</div>
                  <div className="text-xl font-black text-emerald-700 mt-0.5">
                    ¥{estimate.totalToll.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    (片道 約¥{estimate.oneWayToll.toLocaleString()})
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                ※反映後も、入力画面でいつでも数値を自由に手動補正（微調整）できます。
              </p>

              <button
                type="button"
                onClick={handleApply}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                この数値を入力欄にセットする
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
