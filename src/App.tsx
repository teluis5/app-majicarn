import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { QuickInputCard } from './components/QuickInputCard';
import { DetailedSettingsAccordion } from './components/DetailedSettingsAccordion';
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

  // 運転手が無料かどうか
  const isDriverFree = useMemo(() => {
    const driver = members.find((m) => m.isDriver || m.isOwner);
    return driver?.discountType === 'free';
  }, [members]);

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

  // 人数クイック変更
  const handleMembersCountChange = (targetCount: number) => {
    const currentCount = members.length;
    if (targetCount === currentCount) return;

    if (targetCount > currentCount) {
      const added: Member[] = [];
      for (let i = currentCount; i < targetCount; i++) {
        added.push({
          id: 'm_' + (Date.now() + i),
          name: `メンバー${String.fromCharCode(65 + i)}`,
          isOwner: false,
          isDriver: false,
          discountType: 'none',
          discountValue: 0,
          extraAdvancePaid: 0,
        });
      }
      setMembers([...members, ...added]);
    } else {
      // 減らす場合（オーナーは必ず残す）
      const owner = members.find((m) => m.isOwner) || members[0];
      const others = members.filter((m) => m.id !== owner.id).slice(0, targetCount - 1);
      setMembers([owner, ...others]);
    }
  };

  // 運転手無料クイックトグル
  const handleToggleDriverFree = (isFree: boolean) => {
    const next = members.map((m) => {
      if (m.isDriver || m.isOwner) {
        return {
          ...m,
          discountType: isFree ? ('free' as const) : ('none' as const),
          discountValue: isFree ? 100 : 0,
        };
      }
      return m;
    });
    setMembers(next);
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
      <main className="max-w-4xl mx-auto px-4 py-6 w-full flex-1 space-y-6">
        {/* コンセプトバナー（控えめサイズ） */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xs flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-black tracking-tight">
              🚗 諸経費・維持費も公平に入る車代割り勘
            </h2>
            <p className="text-[11px] text-blue-100 mt-0.5">
              走行距離・高速代・人数を入れるだけで即座に精算できます。
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsInfoOpen(true)}
            className="text-[11px] font-bold px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl shrink-0 transition-colors"
          >
            維持費の考え方
          </button>
        </div>

        {/* 2カラム / 1カラム レスポンシブレイアウト */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 左側: クイック入力カード ＋ 詳細設定アコーディオン */}
          <div className="lg:col-span-7 space-y-5">
            {/* 爆速クイック入力カード（メイン） */}
            <QuickInputCard
              trip={trip}
              members={members}
              onTripChange={handleTripChange}
              onMembersCountChange={handleMembersCountChange}
              onToggleDriverFree={handleToggleDriverFree}
              isDriverFree={isDriverFree}
            />

            {/* 詳細設定・個別調整アコーディオン（普段は折りたたみ） */}
            <DetailedSettingsAccordion
              trip={trip}
              members={members}
              settings={settings}
              onTripChange={handleTripChange}
              onMaintenanceChange={handleMaintenanceChange}
              onMembersChange={setMembers}
              onSettingsChange={setSettings}
              onOpenHelp={() => setIsInfoOpen(true)}
            />
          </div>

          {/* 右側: 結果カード & 精算・送金ルート (Sticky) */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
            {/* 結果サマリーカード */}
            <ResultSummaryCard trip={trip} result={splitResult} />

            {/* 精算・送金ルート ＋ LINE共有ボタン */}
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
