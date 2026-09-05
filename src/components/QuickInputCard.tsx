import React from 'react';
import { Navigation, Users, Car, Gift } from 'lucide-react';
import type { CarTypePreset, TripData } from '../types/calculator';
import { CAR_TYPE_PRESETS } from '../utils/calculation';

interface QuickInputCardProps {
  trip: TripData;
  onTripChange: (updated: Partial<TripData>) => void;
}

export const QuickInputCard: React.FC<QuickInputCardProps> = ({
  trip,
  onTripChange,
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

  const quickDistances = [50, 100, 150, 200, 300];
  const quickPassengerCounts = [1, 2, 3, 4, 5];

  const isDriverFree = trip.driverDiscount === 'free';

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-5">
      {/* 1. 車種選択 */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Car className="w-4 h-4 text-blue-600" />
            1. 車種タイプ（燃費・維持費が自動連動）
          </span>
          <span className="text-[11px] font-normal text-slate-400">
            維持費: ¥{CAR_TYPE_PRESETS[currentCarType]?.ratePerKm || 15}/km
          </span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { key: 'kei', label: '軽自動車', sub: 'ハスラー/N-BOX等' },
              { key: 'sedan_suv', label: '普通車/SUV', sub: 'ヤリス/カローラ等' },
              { key: 'minivan', label: 'ミニバン', sub: 'セレナ/ノア等' },
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
                className={`py-2.5 px-2 rounded-2xl border text-center transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-xs sm:text-sm leading-tight">{item.label}</div>
                <div
                  className={`text-[10px] mt-0.5 leading-tight truncate ${
                    isSelected ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  {item.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. 走行距離 & 高速代 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 走行距離 */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-indigo-600" />
            2. 走行距離
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
              className="w-full px-4 py-3 text-xl font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-sm text-slate-400">
              km
            </span>
          </div>
          <div className="flex gap-1 mt-1.5">
            {quickDistances.map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => onTripChange({ distanceKm: km })}
                className={`flex-1 py-1 text-[11px] rounded-lg font-bold border transition-all ${
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
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>3. 高速道路・ETC料金</span>
            <span className="text-[10px] text-slate-400 font-normal">なければ空欄でOK</span>
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
              className="w-full px-4 py-3 text-xl font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-sm text-slate-400">
              円
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            ※ETCカード利用分や有料道路代
          </p>
        </div>
      </div>

      {/* 3. 同乗者の人数（名前入力不要！） */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-purple-600" />
            4. 同乗者の人数（あなた以外の乗客）
          </span>
          <span className="text-xs font-black text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
            同乗者 {trip.passengerCount}名（全体 {1 + trip.passengerCount}名）
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
                className={`py-2.5 rounded-xl font-extrabold text-sm border transition-all ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
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
      <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200/80 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-950">
              運転手（あなた）は無料にする
            </div>
            <div className="text-[10px] text-amber-800/80">
              同乗者の人数のみで全額割り勘します
            </div>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 ml-2">
          <input
            type="checkbox"
            checked={isDriverFree}
            onChange={(e) =>
              onTripChange({ driverDiscount: e.target.checked ? 'free' : 'none' })
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
        </label>
      </div>
    </div>
  );
};
