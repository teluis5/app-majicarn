import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { QuickInputCard } from './components/QuickInputCard';
import { DetailedSettingsAccordion } from './components/DetailedSettingsAccordion';
import { SettlementSection } from './components/SettlementSection';
import { InfoModal } from './components/InfoModal';
import { ShareModal } from './components/ShareModal';
import { CarProfileModal } from './components/CarProfileModal';
import { Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import type {
  CalculationSettings,
  SavedCarProfile,
  TripData,
} from './types/calculator';
import { calculateSimpleSplit } from './utils/calculation';
import { copyToClipboard, generateShareText } from './utils/share';
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
  const [payPayId, setPayPayId] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isDestinationSet, setIsDestinationSet] = useState<boolean>(false);

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);

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

  const handleCopy = async () => {
    const text = generateShareText(trip, splitResult, payPayId);
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.9 },
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    if (window.confirm('入力内容を初期値にリセットしますか？')) {
      setTrip(DEFAULT_TRIP_DATA);
      setSettings(DEFAULT_SETTINGS);
      setActiveCarName('');
      setPayPayId('');
      setIsDestinationSet(false);
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
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col justify-between">
      <div className="w-full">
        {/* ミニマルヘッダー */}
        <Header
          onOpenCarProfile={() => setIsCarModalOpen(true)}
          onReset={handleReset}
          onToggleHelp={() => setIsInfoOpen(true)}
          carName={activeCarName}
        />

        {/* 1枚のシームレスなフラットキャンバス（バブル全廃・幅420pxに最適化） */}
        <main className="max-w-md mx-auto px-4 py-4 space-y-5 pb-28">
          {/* 1. 入力セクション（人数・車種・目的地 ➔ 決定後に即座に支払額＆総額表示 ➔ 下に4大セクション展開） */}
          <QuickInputCard
            trip={trip}
            splitResult={splitResult}
            onTripChange={handleTripChange}
            isDestinationSet={isDestinationSet}
            onDestinationConfirmed={() => setIsDestinationSet(true)}
            onResetDestination={() => setIsDestinationSet(false)}
          />

          {/* 目的地決定後にのみ表示される送金・詳細設定 */}
          {isDestinationSet && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* 2. 送金案内・PayPayメモ */}
              <SettlementSection
                trip={trip}
                result={splitResult}
                onOpenShareModal={() => setIsShareOpen(true)}
                payPayId={payPayId}
                onPayPayIdChange={setPayPayId}
                copied={copied}
                onCopySuccess={handleCopy}
              />

              {/* 4. 詳細設定（折りたたみ） */}
              <DetailedSettingsAccordion
                trip={trip}
                settings={settings}
                onTripChange={handleTripChange}
                onMaintenanceChange={handleMaintenanceChange}
                onSettingsChange={setSettings}
                onOpenHelp={() => setIsInfoOpen(true)}
              />
            </div>
          )}
        </main>
      </div>

      {/* スマホ用 最下部固定バー（目的地決定後にのみ表示） */}
      {isDestinationSet && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg animate-in slide-in-from-bottom-2 duration-200">
          <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold text-slate-400 leading-none">
                同乗者 1人あたり
              </div>
              <div className="text-xl font-black text-slate-900 leading-tight mt-0.5">
                ¥{splitResult.passengerShare.toLocaleString()}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 max-w-[220px] py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>コピー完了！</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>LINE用にコピー</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* モーダル群 */}
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        trip={trip}
        result={splitResult}
        payPayId={payPayId}
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
