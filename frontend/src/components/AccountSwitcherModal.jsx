import React, { useState } from 'react';
import { X, Check, Trash2, Plus, User, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccountSwitcherModal = ({ isOpen, onClose, savedAccounts, currentUserId, onSwitch, onRemove }) => {
  const [switchingId, setSwitchingId] = useState(null);
  const [switchError, setSwitchError] = useState(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSwitch = async (acc) => {
    if (String(acc.id) === String(currentUserId)) {
      onClose();
      return;
    }

    setSwitchError(null);
    setSwitchingId(acc.id);
    const success = await onSwitch(acc);
    setSwitchingId(null);
    if (success) {
      onClose();
    } else {
      setSwitchError(`Session expired for ${acc.username}. Please log in again.`);
    }
  };

  const handleAddAccount = () => {
    onClose();
    navigate('/login?addAccount=true');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 relative text-white">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Switch Account</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {switchError && (
          <div className="p-3 bg-red-950/40 border border-red-800/40 text-red-400 rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{switchError}</span>
          </div>
        )}

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {savedAccounts.length === 0 ? (
            <p className="text-center text-slate-500 text-xs py-4">No other accounts saved on this device.</p>
          ) : (
            savedAccounts.map((acc) => {
              const isActive = String(acc.id) === String(currentUserId);
              const isSwitching = switchingId === acc.id;

              return (
                <div
                  key={acc.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 border-cyan-500/30'
                      : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate pr-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
                      {acc.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm truncate">{acc.username}</span>
                        {isActive && (
                          <span className="text-2xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded font-semibold">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-xs truncate">{acc.email || 'Saved'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {isActive ? (
                      <span className="p-2 text-cyan-400">
                        <Check className="w-5 h-5" />
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSwitch(acc)}
                          disabled={isSwitching}
                          className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          {isSwitching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Switch'}
                        </button>
                        <button
                          onClick={() => onRemove(acc.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Remove saved account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-slate-800 pt-3">
          <button
            onClick={handleAddAccount}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-950/60 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl border border-slate-800 transition-colors text-sm"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            Add Another Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSwitcherModal;
