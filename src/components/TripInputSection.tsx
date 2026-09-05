import React from 'react';
import { Fuel, Gauge, Navigation } from 'lucide-react';
import type { TripData } from '../types/calculator';
import { calculateFuelCost } from '../utils/calculation';

interface TripInputSectionProps {
  trip: TripData;
  onChange: (updated: Partial<TripData>) => void;
}

export const TripInputSection: React.FC<TripInputSectionProps> = ({ trip, onChange }) => {
  const fuelCost = calculateFuelCost(trip);
  const calculatedLiters =
    trip.distanceKm > 0 && trip.fuelEfficiency > 0
      ? Math.round((trip.distanceKm / trip.fuelEfficiency) * 10) / 10
      : 0;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
            1
          </span>
          走行距離・ガソリン代
        </h2>
        <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md">
          燃料代: ¥{fuelCost.toLocaleString()}
        </span>
      </div>

      <div className="space-y-4">
        {/* 走行距離 */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            走行距離 (km)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="1"
              value={trip.distanceKm === 0 ? '' : trip.distanceKm}
              onChange={(e) =>
                onChange({ distanceKm: Math.max(0, parseFloat(e.target.value) || 0) })
              }
              placeholder="例: 150"
              className="w-full px-3.5 py-2.5 text-lg font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
              km
            </span>
          </div>
          {/* クイック距離ボタン */}
          <div className="flex gap-1.5 mt-2">
            {[50, 100, 150, 200, 300].map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => onChange({ distanceKm: km })}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                  trip.distanceKm === km
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {km}km
              </button>
            ))}
          </div>
        </div>

        {/* ガソリン代モード切替 */}
        <div>
          <div className="flex rounded-xl bg-slate-100 p-1 mb-3">
            <button
              type="button"
              onClick={() => onChange({ fuelMode: 'calculate' })}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                trip.fuelMode === 'calculate'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              燃費と単価から自動計算
            </button>
            <button
              type="button"
              onClick={() => onChange({ fuelMode: 'actual' })}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                trip.fuelMode === 'actual'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              給油レシート実費を入力
            </button>
          </div>

          {trip.fuelMode === 'calculate' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl">
              {/* 実燃費 */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-indigo-500" />
                  実燃費 (km/L)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={trip.fuelEfficiency === 0 ? '' : trip.fuelEfficiency}
                    onChange={(e) =>
                      onChange({
                        fuelEfficiency: Math.max(0.1, parseFloat(e.target.value) || 0),
                      })
                    }
                    placeholder="15.0"
                    className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    km/L
                  </span>
                </div>
              </div>

              {/* ガソリン単価 */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Fuel className="w-3.5 h-3.5 text-rose-500" />
                  ガソリン単価 (円/L)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={trip.fuelPricePerLiter === 0 ? '' : trip.fuelPricePerLiter}
                    onChange={(e) =>
                      onChange({
                        fuelPricePerLiter: Math.max(0, parseFloat(e.target.value) || 0),
                      })
                    }
                    placeholder="175"
                    className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    円/L
                  </span>
                </div>
              </div>

              <div className="col-span-full flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/60">
                <span>概算消費ガソリン量: 約 {calculatedLiters} L</span>
                <span className="font-semibold text-slate-700">
                  {trip.distanceKm > 0
                    ? `1kmあたり約 ${(fuelCost / (trip.distanceKm || 1)).toFixed(1)} 円`
                    : ''}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl">
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Fuel className="w-3.5 h-3.5 text-rose-500" />
                給油レシート合計額 (円)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={trip.actualFuelCost === 0 ? '' : trip.actualFuelCost}
                  onChange={(e) =>
                    onChange({
                      actualFuelCost: Math.max(0, parseInt(e.target.value, 10) || 0),
                    })
                  }
                  placeholder="例: 4500"
                  className="w-full px-3.5 py-2.5 text-base font-bold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  円
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">
                ※満タン返し時の給油伝票や、途中給油したレシートの合計を入力してください。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
