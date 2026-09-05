import React from 'react';
import { Navigation, Users, Search } from 'lucide-react';
import type { CarTypePreset, TripData } from '../types/calculator';
import { CAR_TYPE_PRESETS } from '../utils/calculation';

interface QuickInputCardProps {
  trip: TripData;
  onTripChange: (updated: Partial<TripData>) => void;
  onOpenRouteSearch: () => void;
  autoRouteLabel?: string;
}

export const QuickInputCard: React.FC<QuickInputCardProps> = ({
  trip,
  onTripChange,
  onOpenRouteSearch,
  autoRouteLabel,
}) => {
  const currentCarType = trip.maintenance.carType;

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

  const quickPassengerCounts = [1, 2, 3, 4, 5];
  const isDriverFree = trip.driverDiscount === 'free';

  return (
    <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-100 space-y-4">
      {/* ルート自動入力トリガーボタン */}
      <div>
        <button
          type="button"
          onClick={onOpenRouteSearch}
          className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 active:scale-[0.99] border border-slate-200 rounded-xl flex items-center justify-between text-left transition-all"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Search className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate">
                {autoRouteLabel || '目的地から距離・高速代を自動入力'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {autoRouteLabel ? 'タップして変更（下の枠で手動補正も可能）' : '箱根、熱海、富士山など地名を入れるだけ'}
              </div>
            </div>
          </div>
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md shrink-0 ml-1">
            自動計算
          </span>
        </button>
      </div>

      {/* 1. 車種セグメントコントロール（iOSスタイル） */}
      <div>
        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 flex items-center justify-between">
          <span>車種</span>
          <span className="text-slate-400 font-normal">
            維持費: ¥{CAR_TYPE_PRESETS[currentCarType]?.ratePerKm || 15}/km
          </span>
        </label>
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
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
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

      {/* 2. 走行距離 & 高速代（2列グリッド） */}
      <div className="grid grid-cols-2 gap-3">
        {/* 走行距離 */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-slate-400" />
            走行距離
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
              className="w-full px-3 py-2.5 text-lg font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all pr-8"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              km
            </span>
          </div>
        </div>

        {/* 高速代 */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">
            高速・ETC代
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
              className="w-full px-3 py-2.5 text-lg font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all pr-8"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
              円
            </span>
          </div>
        </div>
      </div>

      {/* 3. 同乗者の人数 */}
      <div>
        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 flex items-center justify-between">
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
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-800 block">
            運転手（あなた）は無料
          </span>
          <span className="text-[10px] text-slate-400">
            同乗者のみで割り勘します
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
