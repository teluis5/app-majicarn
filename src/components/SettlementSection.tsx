import React from 'react';
import { Copy, Check, MessageSquare, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SimpleSplitResult, TripData } from '../types/calculator';
import { copyToClipboard, generateShareText } from '../utils/share';

interface SettlementSectionProps {
  trip: TripData;
  result: SimpleSplitResult;
  onOpenShareModal: () => void;
  payPayId: string;
  onPayPayIdChange: (id: string) => void;
  copied: boolean;
  onCopySuccess: () => void;
}

export const SettlementSection: React.FC<SettlementSectionProps> = ({
  trip,
  result,
  onOpenShareModal,
  payPayId,
  onPayPayIdChange,
  copied,
  onCopySuccess,
}) => {
  const handleCopyText = async () => {
    const text = generateShareText(trip, result, payPayId);
    const ok = await copyToClipboard(text);
    if (ok) {
      onCopySuccess();
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.85 },
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-100 space-y-3">
      {/* PayPay ID入力（任意） */}
      <div>
        <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1">
          <QrCode className="w-3 h-3 text-slate-400" />
          送金先メモ (PayPay ID等 / 任意)
        </label>
        <input
          type="text"
          value={payPayId}
          onChange={(e) => onPayPayIdChange(e.target.value)}
          placeholder="paypay.me/xxxx や 口座番号など"
          className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
        />
      </div>

      {/* LINEコピーボタン ＆ プレビュー */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={handleCopyText}
          className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>コピー完了！</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>LINE用にコピー</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenShareModal}
          className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
        >
          <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
          <span>プレビュー</span>
        </button>
      </div>
    </div>
  );
};
