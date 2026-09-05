import React from 'react';
import { Check, Sliders } from 'lucide-react';
import type { CarTypePreset, MaintenanceSettings } from '../types/calculator';
import { CAR_TYPE_PRESETS, getMaintenanceRatePerKm } from '../utils/calculation';

interface MaintenanceSectionProps {
  distanceKm: number;
  maintenance: MaintenanceSettings;
  onChange: (updated: Partial<MaintenanceSettings>) => void;
  onOpenHelp: () => void;
}

export const MaintenanceSection: React.FC<MaintenanceSectionProps> = ({
  distanceKm,
  maintenance,
  onChange,
  onOpenHelp,
}) => {
  const ratePerKm = getMaintenanceRatePerKm(maintenance);
  const totalMaintenanceCost = maintenance.enabled ? Math.round(ratePerKm * (distanceKm || 0)) : 0;
  const sharedCost = Math.round(totalMaintenanceCost * ((maintenance.burdenSharePercent ?? 100) / 100));

  const handlePresetSelect = (preset: CarTypePreset) => {
    onChange({
      carType: preset,
      mode: 'preset',
      customRatePerKm: CAR_TYPE_PRESETS[preset].ratePerKm,
    });
  };

  const handleDetailedFieldChange = (key: keyof MaintenanceSettings['detailed'], value: number) => {
    onChange({
      mode: 'detailed',
      detailed: {
        ...maintenance.detailed,
        [key]: Math.max(0, value),
      },
    });
  };

  return (
    <div className="bg-gradient-to-br from-white via-indigo-50/20 to-blue-50/30 rounded-2xl p-5 shadow-xs border border-indigo-100 relative overflow-hidden">
      {/* 背景の装飾 */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3 relative">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            3
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                車両維持費 (ランニングコスト)
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                MajiCarn独自
              </span>
            </div>
          </div>
        </div>

        {/* ON / OFF トグル */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xs font-bold text-slate-600">
            {maintenance.enabled ? '含める (推奨)' : '含めない'}
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={maintenance.enabled}
              onChange={(e) => onChange({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </div>
        </label>
      </div>

      <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
        <span>車検・タイヤ摩耗・オイル交換等の走行消耗分を公平に算定します。</span>
        <button
          type="button"
          onClick={onOpenHelp}
          className="text-indigo-600 hover:text-indigo-800 font-bold underline inline-flex items-center gap-0.5"
        >
          根拠を見る
        </button>
      </p>

      {maintenance.enabled && (
        <div className="space-y-4">
          {/* 金額ハイライトサマリー */}
          <div className="flex flex-wrap items-center justify-between p-3.5 bg-white/90 border border-indigo-100 rounded-xl shadow-xs gap-2">
            <div>
              <div className="text-xs text-slate-500 font-medium">
                走行 {distanceKm}km × <span className="font-bold text-indigo-700">¥{ratePerKm}/km</span>
              </div>
              <div className="text-xl font-extrabold text-indigo-900">
                ¥{sharedCost.toLocaleString()}
                {maintenance.burdenSharePercent < 100 && (
                  <span className="text-xs font-normal text-slate-500 ml-1.5">
                    (全額 ¥{totalMaintenanceCost.toLocaleString()} の {maintenance.burdenSharePercent}%を割当)
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-lg">
                車主の消耗手当として加算
              </span>
            </div>
          </div>

          {/* モード切替タブ */}
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => onChange({ mode: 'preset' })}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                maintenance.mode === 'preset'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              車種タイプから選ぶ（かんたん）
            </button>
            <button
              type="button"
              onClick={() => onChange({ mode: 'detailed' })}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                maintenance.mode === 'detailed'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              年間維持費から精密計算
            </button>
          </div>

          {maintenance.mode === 'preset' ? (
            <div>
              {/* 車種プリセット選択 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(CAR_TYPE_PRESETS) as CarTypePreset[]).map((presetKey) => {
                  const preset = CAR_TYPE_PRESETS[presetKey];
                  const isSelected = maintenance.carType === presetKey;
                  return (
                    <button
                      key={presetKey}
                      type="button"
                      onClick={() => handlePresetSelect(presetKey)}
                      className={`p-3 rounded-xl text-left border transition-all relative ${
                        isSelected
                          ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'bg-white/80 border-slate-200 hover:border-indigo-200'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                      <div className="font-bold text-xs text-slate-800">{preset.name}</div>
                      <div className="text-sm font-extrabold text-indigo-600 mt-1">
                        ¥{preset.ratePerKm}
                        <span className="text-[10px] font-normal text-slate-500"> /km</span>
                      </div>
                      <div className="text-[10px] text-slate-500 line-clamp-1 mt-1">
                        {preset.description}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* カスタムレート入力 */}
              {maintenance.carType === 'custom' && (
                <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-700">カスタム1km単価:</span>
                  <div className="relative w-32">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={maintenance.customRatePerKm || ''}
                      onChange={(e) =>
                        onChange({
                          customRatePerKm: Math.max(1, parseFloat(e.target.value) || 0),
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm font-bold text-slate-900 border border-slate-200 rounded-lg"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      円/km
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* 詳細逆算モード */
            <div className="bg-white p-4 rounded-xl border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700">愛車の年間コストを入力</span>
                <span className="text-xs font-extrabold text-indigo-600">
                  逆算単価: ¥{ratePerKm} /km
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    年間走行距離 (km)
                  </label>
                  <input
                    type="number"
                    step="500"
                    value={maintenance.detailed.annualMileage || ''}
                    onChange={(e) =>
                      handleDetailedFieldChange('annualMileage', parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    車検費用 (年額換算 / 2年分÷2)
                  </label>
                  <input
                    type="number"
                    step="5000"
                    value={maintenance.detailed.annualInspectionCost || ''}
                    onChange={(e) =>
                      handleDetailedFieldChange('annualInspectionCost', parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    任意保険・自賠責 (年額)
                  </label>
                  <input
                    type="number"
                    step="5000"
                    value={maintenance.detailed.annualInsuranceCost || ''}
                    onChange={(e) =>
                      handleDetailedFieldChange('annualInsuranceCost', parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    自動車税・重量税 (年額)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={maintenance.detailed.annualTaxCost || ''}
                    onChange={(e) =>
                      handleDetailedFieldChange('annualTaxCost', parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="col-span-full">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    タイヤ・オイル交換・定期メンテナンス (年額)
                  </label>
                  <input
                    type="number"
                    step="5000"
                    value={maintenance.detailed.annualMaintenanceCost || ''}
                    onChange={(e) =>
                      handleDetailedFieldChange('annualMaintenanceCost', parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 維持費の負担割合スライダー */}
          <div className="bg-white/80 p-3.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                維持費の割り勘対象割合
              </span>
              <span className="font-bold text-indigo-600">
                {maintenance.burdenSharePercent}%
                {maintenance.burdenSharePercent === 100
                  ? ' (全員で全額等分)'
                  : maintenance.burdenSharePercent === 50
                  ? ' (車主が半分負担)'
                  : ''}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={maintenance.burdenSharePercent}
              onChange={(e) => onChange({ burdenSharePercent: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0% (車主が全負担)</span>
              <span>50% (半額を割り勘)</span>
              <span>100% (全員で公平割り勘)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
