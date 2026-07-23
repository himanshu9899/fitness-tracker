import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { Lock, User, AlertCircle, Trash2, Plus, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, savedAccounts, switchAccount, removeSavedAccount } = useAuth();
  
  const [localLoading, setLocalLoading] = useState(false);
  const [switchingId, setSwitchingId] = useState(null);
  const [switchError, setSwitchError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const isAddAccountParam = new URLSearchParams(location.search).get('addAccount') === 'true';
  const [showLoginForm, setShowLoginForm] = useState(savedAccounts.length === 0 || isAddAccountParam);

  useEffect(() => {
    if (savedAccounts.length === 0) {
      setShowLoginForm(true);
    }
  }, [savedAccounts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    const success = await login(username, password);
    setLocalLoading(false);
    if (success) {
      navigate('/');
    }
  };

  const handleSavedAccountClick = async (acc) => {
    setSwitchError(null);
    setSwitchingId(acc.id);
    const success = await switchAccount(acc);
    setSwitchingId(null);
    if (success) {
      navigate('/');
    } else {
      setSwitchError(`Session expired for ${acc.username}. Please enter your password.`);
      setUsername(acc.username);
      setShowLoginForm(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      {/* Background Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative z-10 space-y-6">
        <div className="flex flex-col items-center">
          <Logo size="lg" className="mb-2" />
          <p className="text-slate-400 text-sm mt-1">Track workouts, diet, and progress</p>
        </div>

        {/* Display errors */}
        {(error || switchError) && (
          <div className="p-4 bg-red-950/40 border border-red-800/40 text-red-400 rounded-xl flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <span>{error || switchError}</span>
          </div>
        )}

        {/* Saved Accounts Picker Section (Instagram/Gmail style) */}
        {!showLoginForm && savedAccounts.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Saved Accounts on Device
              </h3>
              <span className="text-2xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full font-semibold">
                {savedAccounts.length} Saved
              </span>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {savedAccounts.map((acc) => {
                const isSwitching = switchingId === acc.id;

                return (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 rounded-xl transition-all group"
                  >
                    <button
                      onClick={() => handleSavedAccountClick(acc)}
                      disabled={isSwitching}
                      className="flex items-center gap-3 truncate text-left flex-1"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-white text-base shadow shrink-0">
                        {acc.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors truncate">
                          {acc.username}
                        </p>
                        <p className="text-slate-500 text-xs truncate">{acc.email || 'Saved Login'}</p>
                      </div>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleSavedAccountClick(acc)}
                        disabled={isSwitching}
                        className="p-2 text-cyan-400 hover:text-cyan-300 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Log in"
                      >
                        {isSwitching ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <ArrowRight className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => removeSavedAccount(acc.id)}
                        className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Remove saved account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowLoginForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl border border-slate-700 transition-all text-sm mt-2"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              Log Into Another Account
            </button>
          </div>
        )}

        {/* Standard Password Login Form */}
        {showLoginForm && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {savedAccounts.length > 0 && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account Login</span>
                <button
                  type="button"
                  onClick={() => setShowLoginForm(false)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  &larr; View Saved Accounts
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={localLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/30 transition-all duration-300 transform active:scale-95 disabled:opacity-50 text-sm"
            >
              {localLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-slate-400 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
            Sign up
          </Link>
        </p>

        {/* Demo details box for convenience */}
        <div className="mt-4 p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-cyan-400">💡 Quick Demo Login:</p>
          <p>Username: <code className="text-white font-mono">demo</code></p>
          <p>Password: <code className="text-white font-mono">password123</code></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
