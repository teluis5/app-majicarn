import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SplitResult, TripData } from '../types/calculator';
import { copyToClipboard, generateShareText } from '../utils/share';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripData;
  result: SplitResult;
  payPayId?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  trip,
  result,
  payPayId,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = generateShareText(trip, result, payPayId);

  const handleCopy = async () => {
    const ok = await copyToClipboard(shareText);
    if (ok) {
      setCopied(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenLine = () => {
    // LINE URLスキーム（Web版 / モバイル版）
    const url = `https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                LINE・メッセージ共有
              </h2>
              <p className="text-xs text-slate-500">
                この内容をそのままグループチャットに送信できます
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* テキストエリアプレビュー */}
        <div className="p-4 flex-1 overflow-y-auto">
          <textarea
            readOnly
            value={shareText}
            rows={14}
            className="w-full p-3 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:bg-white"
          />
        </div>

        {/* フッターアクション */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>クリップボードにコピー済み！</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>テキストをコピー</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleOpenLine}
            className="py-2.5 px-4 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <ExternalLink className="w-4 h-4" />
            <span>LINEで直接送る</span>
          </button>
        </div>
      </div>
    </div>
  );
};
