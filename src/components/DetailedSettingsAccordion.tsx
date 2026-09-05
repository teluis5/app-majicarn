import React, { useState } from 'react';
import { ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import type { CalculationSettings, Member, TripData } from '../types/calculator';
import { TripInputSection } from './TripInputSection';
import { ExpensesSection } from './ExpensesSection';
import { MaintenanceSection } from './MaintenanceSection';
import { MembersSection } from './MembersSection';
import { SettingsBar } from './SettingsBar';

interface DetailedSettingsAccordionProps {
  trip: TripData;
  members: Member[];
  settings: CalculationSettings;
  onTripChange: (updated: Partial<TripData>) => void;
  onMaintenanceChange: (updated: Partial<TripData['maintenance']>) => void;
  onMembersChange: (members: Member[]) => void;
  onSettingsChange: (settings: CalculationSettings) => void;
  onOpenHelp: () => void;
}

export const DetailedSettingsAccordion: React.FC<DetailedSettingsAccordionProps> = ({
  trip,
  members,
  settings,
  onTripChange,
  onMaintenanceChange,
  onMembersChange,
  onSettingsChange,
  onOpenHelp,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden transition-all">
      {/* アコーディオン開閉ヘッダー */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              詳細設定・個別調整
              <span className="text-[11px] font-normal text-slate-400">
                {isOpen ? '（タップで閉じる）' : '（駐車場代・ガソリン価格・立替など）'}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              燃費 {trip.fuelEfficiency}km/L | 単価 ¥{trip.fuelPricePerLiter}/L | 端数 {settings.roundingUnit}円単位
            </div>
          </div>
        </div>

        <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* 展開コンテンツ */}
      {isOpen && (
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-5 animate-in fade-in duration-200">
          {/* ガソリン代詳細設定 */}
          <TripInputSection trip={trip} onChange={onTripChange} />

          {/* 諸経費（駐車場・洗車等） */}
          <ExpensesSection trip={trip} members={members} onChange={onTripChange} />

          {/* 車両維持費の精密設定 */}
          <MaintenanceSection
            distanceKm={trip.distanceKm}
            maintenance={trip.maintenance}
            onChange={onMaintenanceChange}
            onOpenHelp={onOpenHelp}
          />

          {/* メンバー名や立替金の管理 */}
          <MembersSection members={members} onChange={onMembersChange} />

          {/* お釣りの端数丸め設定 */}
          <SettingsBar settings={settings} onChange={onSettingsChange} />
        </div>
      )}
    </div>
  );
};
