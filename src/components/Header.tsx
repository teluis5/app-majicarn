import React from 'react';
import { Car, RotateCcw, Settings, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onOpenCarProfile: () => void;
  onReset: () => void;
  onToggleHelp: () => void;
  carName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCarProfile,
  onReset,
  onToggleHelp,
  carName,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                MajiCarn
                <span className="text-xs px-2 py-0.5 font-bold rounded-full bg-blue-100 text-blue-700 tracking-normal">
                  マジカン
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              維持費・諸経費も公平に入る車代スマート割り勘
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleHelp}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="なぜ維持費を入れるの？"
            aria-label="ヘルプ"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onOpenCarProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">
              {carName ? `車: ${carName}` : 'マイカー設定'}
            </span>
            <span className="sm:hidden">設定</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="入力を初期化"
            aria-label="リセット"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
