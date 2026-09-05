import React, { useState } from 'react';
import { ArrowRight, Copy, Check, MessageSquare, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SplitResult, TripData } from '../types/calculator';
import { copyToClipboard, generateShareText } from '../utils/share';

interface SettlementSectionProps {
  trip: TripData;
  result: SplitResult;
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
    <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
            5
          </span>
          精算・送金ルート
        </h2>
        <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md">
          立替相殺済み
        </span>
      </div>

      {/* 送金ルート一覧 */}
      <div className="space-y-2.5 mb-5">
        {result.transfers.length === 0 ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <span className="text-xs font-bold text-emerald-800">
              🎉 全員の支払いが相殺済み、または追加の送金はありません！
            </span>
          </div>
        ) : (
          result.transfers.map((t, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-extrabold text-sm text-slate-800 truncate">
                  {t.fromName}
                </span>
                <ArrowRight className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="font-extrabold text-sm text-blue-700 truncate">
                  {t.toName}
                </span>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs text-slate-500 mr-1">送金額:</span>
                <span className="text-lg font-black text-slate-900">
                  ¥{t.amount.toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PayPay ID入力（任意） */}
      <div className="mb-5 p-3.5 bg-rose-50/50 border border-rose-100 rounded-xl">
        <label className="block text-xs font-bold text-rose-900 mb-1 flex items-center gap-1.5">
          <QrCode className="w-3.5 h-3.5 text-rose-600" />
          送金先メモ (PayPay IDやリンクなど / 任意)
        </label>
        <input
          type="text"
          value={payPayId}
          onChange={(e) => setPayPayId(e.target.value)}
          placeholder="例: paypay.me/xxxx または 振込先口座番号"
          className="w-full px-3 py-2 text-xs font-medium bg-white border border-rose-200 rounded-lg focus:outline-none focus:border-rose-500"
        />
        <p className="text-[10px] text-rose-700/80 mt-1">
          ※ここに入力すると、LINE共有用テキストに送金先が自動で添えられます。
        </p>
      </div>

      {/* アクションボタン群 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleCopyText}
          className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
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
          className="py-3 px-4 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-700 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <MessageSquare className="w-4 h-4 text-slate-500" />
          <span>内訳テキストをプレビュー</span>
        </button>
      </div>
    </div>
  );
};
