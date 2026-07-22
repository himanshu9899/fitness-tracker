import React from 'react';
import { ShieldCheck, UserCheck, X } from 'lucide-react';

const SaveAccountModal = ({ isOpen, accountInfo, onSave, onDecline }) => {
  if (!isOpen || !accountInfo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 relative text-white">
        <button
          onClick={onDecline}
          className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Save account on this device?</h3>
            <p className="text-slate-400 text-xs mt-1">
              Save login info for <strong className="text-cyan-400">{accountInfo.username}</strong> so you can switch accounts easily next time.
            </p>
          </div>
        </div>

        {/* User Card preview */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-white text-base shadow">
            {accountInfo.username?.charAt(0).toUpperCase()}
          </div>
          <div className="truncate text-left">
            <p className="font-bold text-white text-sm truncate">{accountInfo.username}</p>
            <p className="text-slate-500 text-xs truncate">{accountInfo.email || 'Saved Login'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-2xs text-slate-400 bg-slate-950/30 p-2.5 rounded-lg border border-slate-800/40">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Your password is never stored in plain text. Tokens are kept securely.</span>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onSave}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg transition-all text-sm"
          >
            Save
          </button>
          <button
            onClick={onDecline}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 px-4 rounded-xl border border-slate-700 transition-all text-sm"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveAccountModal;
