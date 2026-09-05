import React from 'react';
import { X, ShieldCheck, HeartHandshake, AlertCircle, Wrench } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              なぜ「車両維持費」も含めるの？
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-sm text-slate-600 leading-relaxed">
          <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">車を出す人の「見えない負担」</p>
              <p className="text-xs text-amber-800 mt-1">
                車は走るほど「タイヤがすり減り」「オイルが劣化し」「走行距離が増えて下取り価値が下がり」ます。
                ガソリン代や高速代だけを割ると、車主がこれらの消耗コストを100%自己負担することになってしまいます。
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-indigo-600" />
              1km走るごとに発生する維持コストの目安
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
              <li>
                <strong>タイヤ摩耗</strong>：約3〜4万kmで交換（1本1.5〜3万円 ➔ 約1〜3円/km）
              </li>
              <li>
                <strong>エンジンオイル・フィルター</strong>：5,000km毎に交換（約1〜2円/km）
              </li>
              <li>
                <strong>車検・定期法定点検費用</strong>：2年毎の整備・消耗部品交換（約3〜6円/km）
              </li>
              <li>
                <strong>任意保険・自賠責・自動車税</strong>：年額数十万円の走行按分（約4〜10円/km）
              </li>
              <li>
                <strong>車両の走行減価償却</strong>：距離増加による車の価値下落
              </li>
            </ul>
          </div>

          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-start gap-3">
            <HeartHandshake className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-indigo-950">「また一緒に行こう」と言える関係のために</p>
              <p className="text-xs text-indigo-900/90 mt-1">
                カーシェアやレンタカーを借りると走行料金（15〜20円/km）がかかります。
                マイカーでも走行距離に応じた少額（10〜20円/km程度）の維持費を出し合うことで、
                車主への一方的な負担をなくし、お互い気持ちよくドライブを楽しめます！
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
          >
            納得して閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
