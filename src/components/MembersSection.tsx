import React from 'react';
import { UserPlus, Trash2, Crown, Award } from 'lucide-react';
import type { DiscountType, Member } from '../types/calculator';

interface MembersSectionProps {
  members: Member[];
  onChange: (members: Member[]) => void;
}

export const MembersSection: React.FC<MembersSectionProps> = ({ members, onChange }) => {
  const handleAddMember = () => {
    const newMember: Member = {
      id: 'm_' + Date.now(),
      name: `メンバー${String.fromCharCode(65 + members.length)}`,
      isOwner: false,
      isDriver: false,
      discountType: 'none',
      discountValue: 0,
      extraAdvancePaid: 0,
    };
    onChange([...members, newMember]);
  };

  const handleUpdateMember = (id: string, updated: Partial<Member>) => {
    const next = members.map((m) => (m.id === id ? { ...m, ...updated } : m));
    onChange(next);
  };

  const handleRemoveMember = (id: string) => {
    if (members.length <= 1) return; // 1人未満にはしない
    onChange(members.filter((m) => m.id !== id));
  };

  const handleSetOwner = (id: string) => {
    // オーナーは1人のみ
    const next = members.map((m) => ({
      ...m,
      isOwner: m.id === id,
    }));
    onChange(next);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
            4
          </span>
          メンバーとドライバー優遇設定
        </h2>
        <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md">
          {members.length} 名
        </span>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className={`p-3.5 rounded-xl border transition-all ${
              member.isOwner
                ? 'bg-amber-50/40 border-amber-200'
                : member.isDriver
                ? 'bg-blue-50/30 border-blue-200'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            {/* 上段: 名前と役割 */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => handleUpdateMember(member.id, { name: e.target.value })}
                  className="font-bold text-sm text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 max-w-[180px]"
                />

                {member.isOwner && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                    <Crown className="w-3 h-3 text-amber-600" /> 車主
                  </span>
                )}
                {member.isDriver && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                    <Award className="w-3 h-3 text-blue-600" /> 運転手
                  </span>
                )}
              </div>

              {/* 役割トグル */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSetOwner(member.id)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all border ${
                    member.isOwner
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  車主
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateMember(member.id, { isDriver: !member.isDriver })}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all border ${
                    member.isDriver
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  運転手
                </button>

                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded ml-1"
                    title="メンバーを削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* 下段: 優遇設定 & 立替メモ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
              {/* ドライバー・車主優遇割引き */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  割り勘の優遇 / 割引
                </label>
                <select
                  value={member.discountType}
                  onChange={(e) =>
                    handleUpdateMember(member.id, {
                      discountType: e.target.value as DiscountType,
                      discountValue:
                        e.target.value === 'free'
                          ? 100
                          : e.target.value === 'percent'
                          ? 50
                          : e.target.value === 'fixed'
                          ? 1000
                          : 0,
                    })
                  }
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md font-medium text-slate-700 focus:outline-none"
                >
                  <option value="none">割引なし (通常均等割)</option>
                  <option value="free">🎉 全額無料 (運転お疲れ様割)</option>
                  <option value="percent">50%OFF (半額優遇)</option>
                  <option value="fixed">定額割引 (指定額を引く)</option>
                </select>
              </div>

              {/* 定額割引入力（fixed選択時） */}
              {member.discountType === 'fixed' && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    割引額 (円)
                  </label>
                  <input
                    type="number"
                    step="100"
                    value={member.discountValue || ''}
                    onChange={(e) =>
                      handleUpdateMember(member.id, {
                        discountValue: Math.max(0, parseInt(e.target.value, 10) || 0),
                      })
                    }
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md font-bold text-slate-900"
                    placeholder="1000"
                  />
                </div>
              )}

              {/* 事前立替額 */}
              <div className={member.discountType === 'fixed' ? 'col-span-full' : ''}>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  その他立替金（買い出し等あれば）
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="100"
                    value={member.extraAdvancePaid === 0 ? '' : member.extraAdvancePaid}
                    onChange={(e) =>
                      handleUpdateMember(member.id, {
                        extraAdvancePaid: Math.max(0, parseInt(e.target.value, 10) || 0),
                      })
                    }
                    placeholder="0"
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md font-bold text-slate-900"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
                    円
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddMember}
          className="w-full py-2.5 px-4 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          メンバーを追加する
        </button>
      </div>
    </div>
  );
};
