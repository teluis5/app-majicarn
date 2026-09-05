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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-900 leading-none">
              MajiCarn
            </h1>
            <span className="text-[10px] text-slate-400 font-medium leading-tight">
              車代スマート割り勘
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleHelp}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            title="維持費の考え方"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenCarProfile}
            className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>{carName || 'マイカー'}</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
            title="リセット"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
