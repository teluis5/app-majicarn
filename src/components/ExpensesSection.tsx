import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { CustomExpense, TripData } from '../types/calculator';

interface ExpensesSectionProps {
  trip: TripData;
  onChange: (updated: Partial<TripData>) => void;
}

export const ExpensesSection: React.FC<ExpensesSectionProps> = ({ trip, onChange }) => {
  const handleAddCustomExpense = () => {
    const newExpense: CustomExpense = {
      id: 'exp_' + Date.now(),
      name: 'その他の諸経費',
      amount: 1000,
    };
    onChange({
      customExpenses: [...(trip.customExpenses || []), newExpense],
    });
  };

  const handleUpdateCustomExpense = (id: string, updated: Partial<CustomExpense>) => {
    const next = (trip.customExpenses || []).map((item) =>
      item.id === id ? { ...item, ...updated } : item
    );
    onChange({ customExpenses: next });
  };

  const handleRemoveCustomExpense = (id: string) => {
    const next = (trip.customExpenses || []).filter((item) => item.id !== id);
    onChange({ customExpenses: next });
  };

  const directTotal =
    (trip.highwayToll || 0) +
    (trip.parkingFee || 0) +
    (trip.carWashFee || 0) +
    (trip.customExpenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-800">
          諸経費の詳細入力 (駐車場代・洗車代など)
        </h3>
        <span className="text-xs font-semibold px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
          小計: ¥{directTotal.toLocaleString()}
        </span>
      </div>

      <div className="space-y-3">
        {/* 駐車場代 */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-700">駐車場代</span>
          <div className="relative w-36">
            <input
              type="number"
              min="0"
              step="50"
              value={trip.parkingFee === 0 ? '' : trip.parkingFee}
              onChange={(e) =>
                onChange({ parkingFee: Math.max(0, parseInt(e.target.value, 10) || 0) })
              }
              placeholder="0"
              className="w-full px-3 py-1.5 text-xs font-bold text-right bg-slate-50 border border-slate-200 rounded-lg pr-7 focus:bg-white focus:outline-none focus:border-blue-500"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              円
            </span>
          </div>
        </div>

        {/* 洗車代 */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-700">洗車代（任意）</span>
          <div className="relative w-36">
            <input
              type="number"
              min="0"
              step="50"
              value={trip.carWashFee === 0 ? '' : trip.carWashFee}
              onChange={(e) =>
                onChange({ carWashFee: Math.max(0, parseInt(e.target.value, 10) || 0) })
              }
              placeholder="0"
              className="w-full px-3 py-1.5 text-xs font-bold text-right bg-slate-50 border border-slate-200 rounded-lg pr-7 focus:bg-white focus:outline-none focus:border-blue-500"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              円
            </span>
          </div>
        </div>

        {/* 同乗者が立て替えた費用（もしあれば） */}
        <div className="flex items-center justify-between gap-3 p-2.5 bg-purple-50/50 border border-purple-100 rounded-xl">
          <div>
            <span className="text-xs font-bold text-purple-900 block">同乗者が立て替えた分</span>
            <span className="text-[10px] text-purple-700">同乗者が駐車場等を直接払った場合に差引</span>
          </div>
          <div className="relative w-36">
            <input
              type="number"
              min="0"
              step="50"
              value={trip.passengerAdvancePaid === 0 ? '' : trip.passengerAdvancePaid}
              onChange={(e) =>
                onChange({ passengerAdvancePaid: Math.max(0, parseInt(e.target.value, 10) || 0) })
              }
              placeholder="0"
              className="w-full px-3 py-1.5 text-xs font-bold text-right bg-white border border-purple-200 rounded-lg pr-7 focus:outline-none focus:border-purple-500"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-purple-400">
              円
            </span>
          </div>
        </div>

        {/* カスタム経費リスト */}
        {(trip.customExpenses || []).map((exp) => (
          <div key={exp.id} className="flex items-center gap-2">
            <input
              type="text"
              value={exp.name}
              onChange={(e) => handleUpdateCustomExpense(exp.id, { name: e.target.value })}
              placeholder="項目名 (例: フェリー代)"
              className="flex-1 px-2.5 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg"
            />
            <div className="relative w-28">
              <input
                type="number"
                min="0"
                step="10"
                value={exp.amount === 0 ? '' : exp.amount}
                onChange={(e) =>
                  handleUpdateCustomExpense(exp.id, {
                    amount: Math.max(0, parseInt(e.target.value, 10) || 0),
                  })
                }
                placeholder="0"
                className="w-full px-2 py-1.5 text-xs font-bold text-right bg-slate-50 border border-slate-200 rounded-lg pr-6"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                円
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleRemoveCustomExpense(exp.id)}
              className="p-1 text-slate-400 hover:text-rose-600 rounded"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddCustomExpense}
          className="w-full py-2 px-3 text-xs font-semibold text-slate-600 hover:text-blue-600 border border-dashed border-slate-300 hover:border-blue-300 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          その他の経費を追加
        </button>
      </div>
    </div>
  );
};
