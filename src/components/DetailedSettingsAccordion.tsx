import React, { useState } from 'react';
import { ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import type { CalculationSettings, TripData } from '../types/calculator';
import { TripInputSection } from './TripInputSection';
import { ExpensesSection } from './ExpensesSection';
import { MaintenanceSection } from './MaintenanceSection';
import { SettingsBar } from './SettingsBar';

interface DetailedSettingsAccordionProps {
  trip: TripData;
  settings: CalculationSettings;
  onTripChange: (updated: Partial<TripData>) => void;
  onMaintenanceChange: (updated: Partial<TripData['maintenance']>) => void;
  onSettingsChange: (settings: CalculationSettings) => void;
  onOpenHelp: () => void;
}

export const DetailedSettingsAccordion: React.FC<DetailedSettingsAccordionProps> = ({
  trip,
  settings,
  onTripChange,
  onMaintenanceChange,
  onSettingsChange,
  onOpenHelp,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="pt-3 border-t border-slate-200/80">
      {/* 開閉バー */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-2.5 flex items-center justify-between text-left hover:text-blue-600 transition-colors"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">
            詳細設定・個別調整
          </span>
          <span className="text-[10px] text-slate-400">
            (燃費手動・駐車場・端数丸め等)
          </span>
        </div>

        <div className="text-slate-400">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* 展開コンテンツ */}
      {isOpen && (
        <div className="pt-3 space-y-4 animate-in fade-in duration-200">
          {/* ガソリン代詳細 */}
          <TripInputSection trip={trip} onChange={onTripChange} />

          {/* 諸経費 */}
          <ExpensesSection trip={trip} onChange={onTripChange} />

          {/* 車両維持費の精密設定 */}
          <MaintenanceSection
            distanceKm={trip.distanceKm}
            maintenance={trip.maintenance}
            onChange={onMaintenanceChange}
            onOpenHelp={onOpenHelp}
          />

          {/* お釣りの端数丸め設定 */}
          <SettingsBar settings={settings} onChange={onSettingsChange} />
        </div>
      )}
    </div>
  );
};
