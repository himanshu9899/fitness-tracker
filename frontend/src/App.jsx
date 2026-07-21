import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import WorkoutLogger from './components/WorkoutLogger';
import DietTracker from './components/DietTracker';
import UserProfile from './components/UserProfile';
import { LayoutDashboard, Dumbbell, Apple, User, LogOut, Activity } from 'lucide-react';

const Layout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-cyan-500/20 border border-cyan-500/30 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              AuraFit
            </span>
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

        {/* Footer info in sidebar */}
        <div className="p-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-sm text-cyan-400">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user?.username}</p>
              <p className="text-3xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
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
