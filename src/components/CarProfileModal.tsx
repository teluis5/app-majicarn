import React, { useState, useEffect } from 'react';
import { X, Car, Plus, Trash2, Bookmark } from 'lucide-react';
import type { CarTypePreset, SavedCarProfile } from '../types/calculator';
import { CAR_TYPE_PRESETS } from '../utils/calculation';
import { loadSavedCarProfiles, saveCarProfiles } from '../utils/storage';

interface CarProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyProfile: (profile: SavedCarProfile) => void;
  currentCarType: CarTypePreset;
  currentFuelEfficiency: number;
}

export const CarProfileModal: React.FC<CarProfileModalProps> = ({
  isOpen,
  onClose,
  onApplyProfile,
  currentCarType,
  currentFuelEfficiency,
}) => {
  const [profiles, setProfiles] = useState<SavedCarProfile[]>([]);
  const [newCarName, setNewCarName] = useState('');
  const [newCarType, setNewCarType] = useState<CarTypePreset>(currentCarType);
  const [newFuelEfficiency, setNewFuelEfficiency] = useState(currentFuelEfficiency);

  useEffect(() => {
    if (isOpen) {
      setProfiles(loadSavedCarProfiles());
      setNewCarType(currentCarType);
      setNewFuelEfficiency(currentFuelEfficiency);
    }
  }, [isOpen, currentCarType, currentFuelEfficiency]);

  if (!isOpen) return null;

  const handleSaveCurrent = () => {
    if (!newCarName.trim()) return;
    const rate = CAR_TYPE_PRESETS[newCarType].ratePerKm;
    const newProfile: SavedCarProfile = {
      id: 'car_' + Date.now(),
      name: newCarName.trim(),
      carType: newCarType,
      fuelEfficiency: newFuelEfficiency,
      customRatePerKm: rate,
    };
    const next = [...profiles, newProfile];
    setProfiles(next);
    saveCarProfiles(next);
    setNewCarName('');
  };

  const handleDelete = (id: string) => {
    const next = profiles.filter((p) => p.id !== id);
    setProfiles(next);
    saveCarProfiles(next);
  };

  const handleApply = (profile: SavedCarProfile) => {
    onApplyProfile(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">マイカー設定の保存</h2>
              <p className="text-xs text-slate-500">愛車の燃費や維持費レートを保存・呼び出し</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 登録済みマイカーリスト */}
        <div className="py-4 space-y-2">
          <span className="text-xs font-bold text-slate-600">保存済みの車両</span>
          {profiles.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
              まだマイカーが登録されていません。<br />下のフォームから現在の設定を保存できます。
            </div>
          ) : (
            profiles.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900">{p.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {CAR_TYPE_PRESETS[p.carType]?.name} | 燃費 {p.fuelEfficiency} km/L | 維持費 ¥{p.customRatePerKm}/km
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApply(p)}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg"
                  >
                    適用
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 新規登録フォーム */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            現在の設定を愛車として保存
          </span>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              車両の愛称・車種名
            </label>
            <input
              type="text"
              value={newCarName}
              onChange={(e) => setNewCarName(e.target.value)}
              placeholder="例: 私のヤリスクロス, 家族のセレナ"
              className="w-full px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                車種区分
              </label>
              <select
                value={newCarType}
                onChange={(e) => setNewCarType(e.target.value as CarTypePreset)}
                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
              >
                {(Object.keys(CAR_TYPE_PRESETS) as CarTypePreset[]).map((k) => (
                  <option key={k} value={k}>
                    {CAR_TYPE_PRESETS[k].name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                実燃費 (km/L)
              </label>
              <input
                type="number"
                step="0.5"
                value={newFuelEfficiency}
                onChange={(e) => setNewFuelEfficiency(parseFloat(e.target.value) || 15)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={!newCarName.trim()}
            onClick={handleSaveCurrent}
            className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
          >
            <Bookmark className="w-3.5 h-3.5" />
            この設定を保存する
          </button>
        </div>
      </div>
    </div>
  );
};
