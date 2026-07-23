import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import WorkoutLogger from './components/WorkoutLogger';
import DietTracker from './components/DietTracker';
import UserProfile from './components/UserProfile';
import SaveAccountModal from './components/SaveAccountModal';
import AccountSwitcherModal from './components/AccountSwitcherModal';
import Logo from './components/Logo';
import { LayoutDashboard, Dumbbell, Apple, User, LogOut, Users, ChevronRight } from 'lucide-react';

const Layout = ({ children }) => {
  const { logout, user, savedAccounts, switchAccount, removeSavedAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/workouts', label: 'Workouts', icon: <Dumbbell className="w-5 h-5" /> },
    { path: '/diet', label: 'Diet & Calorie', icon: <Apple className="w-5 h-5" /> },
    { path: '/profile', label: 'Profile & Goals', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      {/* Side Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div className="p-6">
          <div className="mb-8">
            <Logo size="md" />
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-250 ${
                    active 
                      ? 'bg-gradient-to-r from-cyan-500/15 to-purple-500/5 border border-cyan-500/20 text-cyan-400' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Account Switcher in sidebar */}
        <div className="p-6 border-t border-slate-800 space-y-3">
          {/* Active User Card with Switch Account Action */}
          <button
            onClick={() => setIsSwitcherOpen(true)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all text-left group"
          >
            <div className="flex items-center gap-2.5 truncate pr-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user?.username}</p>
                <p className="text-3xs text-cyan-400 font-medium">Switch account</p>
              </div>
            </div>
            <Users className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0" />
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        {children}
      </main>

      {/* Account Switcher Modal */}
      <AccountSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        savedAccounts={savedAccounts}
        currentUserId={user?.id}
        onSwitch={switchAccount}
        onRemove={removeSavedAccount}
      />
    </div>
  );
};

const GlobalModals = () => {
  const { pendingSaveAccount, confirmSaveAccount, declineSaveAccount } = useAuth();
  return (
    <SaveAccountModal
      isOpen={!!pendingSaveAccount}
      accountInfo={pendingSaveAccount}
      onSave={confirmSaveAccount}
      onDecline={declineSaveAccount}
    />
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <Activity className="w-8 h-8 animate-spin text-cyan-400" />
          <span>Authenticating session...</span>
        </div>
      </div>
    );
  }

  return user ? <Layout>{children}</Layout> : null;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <GlobalModals />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/workouts" element={<ProtectedRoute><WorkoutLogger /></ProtectedRoute>} />
          <Route path="/diet" element={<ProtectedRoute><DietTracker /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
