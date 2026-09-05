import React, { useState } from 'react';
import { ArrowRight, Copy, Check, MessageSquare, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SimpleSplitResult, TripData } from '../types/calculator';
import { copyToClipboard, generateShareText } from '../utils/share';

interface SettlementSectionProps {
  trip: TripData;
  result: SimpleSplitResult;
  onOpenShareModal: () => void;
}

export const SettlementSection: React.FC<SettlementSectionProps> = ({
  trip,
  result,
  onOpenShareModal,
}) => {
  const [payPayId, setPayPayId] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyText = async () => {
    const text = generateShareText(trip, result, payPayId);
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">
          送金・精算案内
        </h3>
        <span className="text-xs font-semibold px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md">
          同乗者 {result.passengerCount}名
        </span>
      </div>

      {/* 送金案内カード */}
      <div className="p-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-100 rounded-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-extrabold text-sm text-slate-800">
            同乗者の皆さん
          </span>
          <ArrowRight className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="font-extrabold text-sm text-blue-700">
            運転手へ
          </span>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs text-slate-500 font-medium">1人あたり送金額</div>
          <div className="text-xl font-black text-slate-900">
            ¥{result.passengerShare.toLocaleString()}
          </div>
        </div>
      </div>

      {/* PayPay ID入力（任意） */}
      <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-2xl">
        <label className="block text-xs font-bold text-rose-900 mb-1 flex items-center gap-1.5">
          <QrCode className="w-3.5 h-3.5 text-rose-600" />
          送金先メモ (PayPay IDやリンク等 / 任意)
        </label>
        <input
          type="text"
          value={payPayId}
          onChange={(e) => setPayPayId(e.target.value)}
          placeholder="例: paypay.me/xxxx または 口座番号"
          className="w-full px-3 py-1.5 text-xs font-medium bg-white border border-rose-200 rounded-xl focus:outline-none focus:border-rose-500"
        />
        <p className="text-[10px] text-rose-700/80 mt-1">
          ※ここに入力すると、LINE用テキストに送金先が自動で添えられます。
        </p>
      </div>

      {/* アクションボタン群 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        <button
          type="button"
          onClick={handleCopyText}
          className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>コピー完了！</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>LINE用にテキストをコピー</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenShareModal}
          className="py-3 px-4 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-700 font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all"
        >
          <MessageSquare className="w-4 h-4 text-slate-500" />
          <span>プレビュー</span>
        </button>
      </div>
    </div>
  );
};
