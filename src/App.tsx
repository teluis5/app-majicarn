import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { QuickInputCard } from './components/QuickInputCard';
import { DetailedSettingsAccordion } from './components/DetailedSettingsAccordion';
import { ResultSummaryCard } from './components/ResultSummaryCard';
import { SettlementSection } from './components/SettlementSection';
import { InfoModal } from './components/InfoModal';
import { ShareModal } from './components/ShareModal';
import { CarProfileModal } from './components/CarProfileModal';
import { RouteSearchModal } from './components/RouteSearchModal';
import type {
  CalculationSettings,
  SavedCarProfile,
  TripData,
} from './types/calculator';
import { calculateSimpleSplit } from './utils/calculation';
import {
  DEFAULT_SETTINGS,
  DEFAULT_TRIP_DATA,
  loadSettings,
  loadTripData,
  saveSettings,
  saveTripData,
} from './utils/storage';

export const App: React.FC = () => {
  const [trip, setTrip] = useState<TripData>(loadTripData);
  const [settings, setSettings] = useState<CalculationSettings>(loadSettings);

  const [activeCarName, setActiveCarName] = useState<string>('');
  const [autoRouteLabel, setAutoRouteLabel] = useState<string>('');

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);

  // リアルタイム計算
  const splitResult = useMemo(() => {
    return calculateSimpleSplit(trip, settings);
  }, [trip, settings]);

  // 状態変更時の自動永続化
  useEffect(() => {
    saveTripData(trip);
  }, [trip]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const handleTripChange = (updated: Partial<TripData>) => {
    setTrip((prev) => ({ ...prev, ...updated }));
  };

  const handleMaintenanceChange = (updated: Partial<TripData['maintenance']>) => {
    setTrip((prev) => ({
      ...prev,
      maintenance: {
        ...prev.maintenance,
        ...updated,
      },
    }));
  };

  // ルート自動計算からの反映ハンドラー
  const handleApplyRoute = (distanceKm: number, highwayToll: number, label: string) => {
    setAutoRouteLabel(label);
    setTrip((prev) => ({
      ...prev,
      distanceKm,
      highwayToll,
    }));
  };

  const handleReset = () => {
    if (window.confirm('入力内容を初期値にリセットしますか？')) {
      setTrip(DEFAULT_TRIP_DATA);
      setSettings(DEFAULT_SETTINGS);
      setActiveCarName('');
      setAutoRouteLabel('');
    }
  };

  const handleApplyCarProfile = (profile: SavedCarProfile) => {
    setActiveCarName(profile.name);
    setTrip((prev) => ({
      ...prev,
      fuelEfficiency: profile.fuelEfficiency,
      maintenance: {
        ...prev.maintenance,
        enabled: true,
        mode: 'preset',
        carType: profile.carType,
        customRatePerKm: profile.customRatePerKm,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans pb-16">
      {/* ナビゲーションヘッダー */}
      <Header
        onOpenCarProfile={() => setIsCarModalOpen(true)}
        onReset={handleReset}
        onToggleHelp={() => setIsInfoOpen(true)}
        carName={activeCarName}
      />

      {/* メインコンテナ */}
      <main className="max-w-4xl mx-auto px-4 py-5 w-full flex-1 space-y-5">
        {/* コンセプトバナー */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xs flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-black tracking-tight">
              🚗 目的地から距離・高速代を自動算出できる車代割り勘
            </h2>
            <p className="text-[11px] text-blue-100 mt-0.5">
              出発地・目的地（往復/片道）を入れるだけで自動入力！あとから自由に手動補正できます。
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsInfoOpen(true)}
            className="text-[11px] font-bold px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl shrink-0 transition-colors"
          >
            維持費の根拠
          </button>
        </div>

        {/* 2カラム / 1カラム レスポンシブレイアウト */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* 左側: クイック入力カード ＋ 詳細設定アコーディオン */}
          <div className="lg:col-span-7 space-y-4">
            {/* 爆速クイック入力カード（メイン） */}
            <QuickInputCard
              trip={trip}
              onTripChange={handleTripChange}
              onOpenRouteSearch={() => setIsRouteModalOpen(true)}
              autoRouteLabel={autoRouteLabel}
            />

            {/* 詳細設定アコーディオン */}
            <DetailedSettingsAccordion
              trip={trip}
              settings={settings}
              onTripChange={handleTripChange}
              onMaintenanceChange={handleMaintenanceChange}
              onSettingsChange={setSettings}
              onOpenHelp={() => setIsInfoOpen(true)}
            />
          </div>

          {/* 右側: 結果カード & 精算・送金ルート (Sticky) */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
            {/* 結果サマリーカード */}
            <ResultSummaryCard trip={trip} result={splitResult} />

            {/* 精算・送金案内 ＋ LINE共有ボタン */}
            <SettlementSection
              trip={trip}
              result={splitResult}
              onOpenShareModal={() => setIsShareOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* モーダル群 */}
      <RouteSearchModal
        isOpen={isRouteModalOpen}
        onClose={() => setIsRouteModalOpen(false)}
        onApplyRoute={handleApplyRoute}
        carType={trip.maintenance.carType}
      />

      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        trip={trip}
        result={splitResult}
      />

      <CarProfileModal
        isOpen={isCarModalOpen}
        onClose={() => setIsCarModalOpen(false)}
        onApplyProfile={handleApplyCarProfile}
        currentCarType={trip.maintenance.carType}
        currentFuelEfficiency={trip.fuelEfficiency}
      />
    </div>
  );
};

export default App;
