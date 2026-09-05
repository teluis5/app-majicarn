import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { CustomExpense, Member, TripData } from '../types/calculator';

interface ExpensesSectionProps {
  trip: TripData;
  members: Member[];
  onChange: (updated: Partial<TripData>) => void;
}

export const ExpensesSection: React.FC<ExpensesSectionProps> = ({
  trip,
  members,
  onChange,
}) => {
  const handleAddCustomExpense = () => {
    const newExpense: CustomExpense = {
      id: 'exp_' + Date.now(),
      name: 'その他の諸経費',
      amount: 1000,
      paidByMemberId: members[0]?.id || 'owner',
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
    (trip.rentalFee || 0) +
    (trip.customExpenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
            2
          </span>
          高速代・駐車場代・その他実費
        </h2>
        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md">
          諸経費小計: ¥{directTotal.toLocaleString()}
        </span>
      </div>

      <div className="space-y-3.5">
        {/* 高速道路代 */}
        <div className="grid grid-cols-12 gap-2.5 items-center">
          <div className="col-span-12 sm:col-span-4">
            <span className="text-xs font-semibold text-slate-700">高速・ETC料金</span>
          </div>
          <div className="col-span-7 sm:col-span-4 relative">
            <input
              type="number"
              min="0"
              step="10"
              value={trip.highwayToll === 0 ? '' : trip.highwayToll}
              onChange={(e) =>
                onChange({ highwayToll: Math.max(0, parseInt(e.target.value, 10) || 0) })
              }
              placeholder="0"
              className="w-full px-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-500"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              円
            </span>
          </div>
          <div className="col-span-5 sm:col-span-4">
            <select
              value={trip.highwayPaidBy}
              onChange={(e) => onChange({ highwayPaidBy: e.target.value })}
              className="w-full px-2.5 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  立替: {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 駐車場代 */}
        <div className="grid grid-cols-12 gap-2.5 items-center">
          <div className="col-span-12 sm:col-span-4">
            <span className="text-xs font-semibold text-slate-700">駐車場代</span>
          </div>
          <div className="col-span-7 sm:col-span-4 relative">
            <input
              type="number"
              min="0"
              step="10"
              value={trip.parkingFee === 0 ? '' : trip.parkingFee}
              onChange={(e) =>
                onChange({ parkingFee: Math.max(0, parseInt(e.target.value, 10) || 0) })
              }
              placeholder="0"
              className="w-full px-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-500"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              円
            </span>
          </div>
          <div className="col-span-5 sm:col-span-4">
            <select
              value={trip.parkingPaidBy}
              onChange={(e) => onChange({ parkingPaidBy: e.target.value })}
              className="w-full px-2.5 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  立替: {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 洗車代 */}
        <div className="grid grid-cols-12 gap-2.5 items-center">
          <div className="col-span-12 sm:col-span-4">
            <span className="text-xs font-semibold text-slate-700">洗車代（任意）</span>
          </div>
          <div className="col-span-7 sm:col-span-4 relative">
            <input
              type="number"
              min="0"
              step="10"
              value={trip.carWashFee === 0 ? '' : trip.carWashFee}
              onChange={(e) =>
                onChange({ carWashFee: Math.max(0, parseInt(e.target.value, 10) || 0) })
              }
              placeholder="0"
              className="w-full px-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-500"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              円
            </span>
          </div>
          <div className="col-span-5 sm:col-span-4">
            <select
              value={trip.carWashPaidBy}
              onChange={(e) => onChange({ carWashPaidBy: e.target.value })}
              className="w-full px-2.5 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  立替: {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* レンタカー/カーシェア代（レンタカー利用時の場合） */}
        <div className="grid grid-cols-12 gap-2.5 items-center">
          <div className="col-span-12 sm:col-span-4">
            <span className="text-xs font-semibold text-slate-700">レンタカー・シェア代</span>
          </div>
          <div className="col-span-7 sm:col-span-4 relative">
            <input
              type="number"
              min="0"
              step="100"
              value={trip.rentalFee === 0 ? '' : trip.rentalFee}
              onChange={(e) =>
                onChange({ rentalFee: Math.max(0, parseInt(e.target.value, 10) || 0) })
              }
              placeholder="0 (マイカー時は0)"
              className="w-full px-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-500"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              円
            </span>
          </div>
          <div className="col-span-5 sm:col-span-4">
            <select
              value={trip.rentalPaidBy}
              onChange={(e) => onChange({ rentalPaidBy: e.target.value })}
              className="w-full px-2.5 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  立替: {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* カスタム経費リスト */}
        {(trip.customExpenses || []).map((exp) => (
          <div
            key={exp.id}
            className="grid grid-cols-12 gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl items-center"
          >
            <div className="col-span-12 sm:col-span-4">
              <input
                type="text"
                value={exp.name}
                onChange={(e) => handleUpdateCustomExpense(exp.id, { name: e.target.value })}
                placeholder="項目名 (例: フェリー代)"
                className="w-full px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="col-span-6 sm:col-span-4 relative">
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
                className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-500"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                円
              </span>
            </div>
            <div className="col-span-5 sm:col-span-3">
              <select
                value={exp.paidByMemberId}
                onChange={(e) =>
                  handleUpdateCustomExpense(exp.id, { paidByMemberId: e.target.value })
                }
                className="w-full px-2 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-md"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    立替: {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-1 text-right">
              <button
                type="button"
                onClick={() => handleRemoveCustomExpense(exp.id)}
                className="p-1 text-slate-400 hover:text-rose-600 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* 項目追加ボタン */}
        <button
          type="button"
          onClick={handleAddCustomExpense}
          className="w-full py-2 px-3 text-xs font-semibold text-slate-600 hover:text-blue-600 border border-dashed border-slate-300 hover:border-blue-300 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          その他の経費を追加 (フェリー代・観光料立替など)
        </button>
      </div>
    </div>
  );
};
