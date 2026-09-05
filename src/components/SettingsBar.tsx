import React from 'react';
import { Coins } from 'lucide-react';
import type { CalculationSettings, RoundingUnit } from '../types/calculator';

interface SettingsBarProps {
  settings: CalculationSettings;
  onChange: (settings: CalculationSettings) => void;
}

export const SettingsBar: React.FC<SettingsBarProps> = ({ settings, onChange }) => {
  return (
    <div className="bg-slate-100/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-1.5 font-bold text-slate-700">
        <Coins className="w-4 h-4 text-amber-500" />
        <span>端数のお釣り処理</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* 丸め単位 */}
        <div className="flex bg-white rounded-lg p-0.5 border border-slate-200">
          {([100, 500, 10, 1] as RoundingUnit[]).map((unit) => (
            <button
              key={unit}
              type="button"
              onClick={() => onChange({ ...settings, roundingUnit: unit })}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                settings.roundingUnit === unit
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {unit === 1 ? '1円単位' : `${unit}円単位`}
            </button>
          ))}
        </div>

        {/* 丸め戦略 */}
        <div className="flex bg-white rounded-lg p-0.5 border border-slate-200">
          {(
            [
              { key: 'ceil', label: '切り上げ (推奨)' },
              { key: 'round', label: '四捨五入' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange({ ...settings, roundingStrategy: item.key })}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                settings.roundingStrategy === item.key
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
