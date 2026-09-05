import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { TripInputSection } from './components/TripInputSection';
import { ExpensesSection } from './components/ExpensesSection';
import { MaintenanceSection } from './components/MaintenanceSection';
import { MembersSection } from './components/MembersSection';
import { SettingsBar } from './components/SettingsBar';
import { ResultSummaryCard } from './components/ResultSummaryCard';
import { SettlementSection } from './components/SettlementSection';
import { InfoModal } from './components/InfoModal';
import { ShareModal } from './components/ShareModal';
import { CarProfileModal } from './components/CarProfileModal';
import type {
  CalculationSettings,
  Member,
  SavedCarProfile,
  TripData,
} from './types/calculator';
import { calculateSplit } from './utils/calculation';
import {
  DEFAULT_MEMBERS,
  DEFAULT_SETTINGS,
  DEFAULT_TRIP_DATA,
  loadMembers,
  loadSettings,
  loadTripData,
  saveMembers,
  saveSettings,
  saveTripData,
} from './utils/storage';

export const App: React.FC = () => {
  const [trip, setTrip] = useState<TripData>(loadTripData);
  const [members, setMembers] = useState<Member[]>(loadMembers);
  const [settings, setSettings] = useState<CalculationSettings>(loadSettings);

  const [activeCarName, setActiveCarName] = useState<string>('');
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);

  // リアルタイム計算
  const splitResult = useMemo(() => {
    return calculateSplit(trip, members, settings);
  }, [trip, members, settings]);

  // 状態変更時の自動永続化
  useEffect(() => {
    saveTripData(trip);
  }, [trip]);

  useEffect(() => {
    saveMembers(members);
  }, [members]);

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

  const handleReset = () => {
    if (window.confirm('入力内容を初期値にリセットしますか？')) {
      setTrip(DEFAULT_TRIP_DATA);
      setMembers(DEFAULT_MEMBERS);
      setSettings(DEFAULT_SETTINGS);
      setActiveCarName('');
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
      <main className="max-w-4xl mx-auto px-4 py-6 w-full flex-1">
        {/* コンセプトバナー */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-base sm:text-lg font-black tracking-tight">
              ガソリン代だけでなく「車の維持費」も割り勘！
            </h2>
            <p className="text-xs text-blue-100 mt-1 leading-relaxed">
              車を出した人の消耗・維持負担を公平に評価し、ドライバー優遇や立替相殺までスムーズに解決します。
            </p>
          </div>
        </div>

        {/* 2カラム / 1カラム レスポンシブレイアウト */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 左側カラム: 各種入力セクション */}
          <div className="lg:col-span-7 space-y-5">
            {/* Step 1: 走行距離 & ガソリン代 */}
            <TripInputSection trip={trip} onChange={handleTripChange} />

            {/* Step 2: 高速代・駐車場代等 */}
            <ExpensesSection trip={trip} members={members} onChange={handleTripChange} />

            {/* Step 3: 車両維持費 (ランニングコスト) */}
            <MaintenanceSection
              distanceKm={trip.distanceKm}
              maintenance={trip.maintenance}
              onChange={handleMaintenanceChange}
              onOpenHelp={() => setIsInfoOpen(true)}
            />

            {/* Step 4: メンバーとドライバー優遇 */}
            <MembersSection members={members} onChange={setMembers} />
          </div>

          {/* 右側カラム: 結果カード & 精算・送金案内 (Sticky) */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
            {/* 結果サマリーカード */}
            <ResultSummaryCard trip={trip} result={splitResult} />

            {/* 端数丸め設定バー */}
            <SettingsBar settings={settings} onChange={setSettings} />

            {/* 精算・送金ルート */}
            <SettlementSection
              trip={trip}
              result={splitResult}
              onOpenShareModal={() => setIsShareOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* モーダル群 */}
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
