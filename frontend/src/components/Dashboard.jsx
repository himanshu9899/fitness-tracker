import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Activity, Flame, Dumbbell, Award, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState(7);

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`analytics/dashboard/?days=${timeframe}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <Activity className="w-8 h-8 animate-spin text-cyan-400" />
          <span>Loading dashboard analytics...</span>
        </div>
      </div>
    );
  }

  const { daily_stats, macro_summary, workout_summary } = data;

  // Compute daily totals
  const calPercent = macro_summary.calories_target > 0 
    ? Math.min(100, Math.round((macro_summary.calories_consumed / macro_summary.calories_target) * 100)) 
    : 0;

  const proteinPercent = macro_summary.protein_target > 0 
    ? Math.min(100, Math.round((macro_summary.protein_consumed / macro_summary.protein_target) * 100)) 
    : 0;

  const carbsPercent = macro_summary.carbs_target > 0 
    ? Math.min(100, Math.round((macro_summary.carbs_consumed / macro_summary.carbs_target) * 100)) 
    : 0;

  const fatPercent = macro_summary.fat_target > 0 
    ? Math.min(100, Math.round((macro_summary.fat_consumed / macro_summary.fat_target) * 100)) 
    : 0;

  // Custom tooltips for Recharts
  const CustomWeightTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl">
          <p className="text-xs text-slate-400 font-medium mb-1">{payload[0].payload.date}</p>
          <p className="text-sm font-bold text-purple-400 font-mono">{payload[0].value} kg</p>
        </div>
      );
    }
    return null;
  };

  const CustomCalorieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl space-y-1">
          <p className="text-xs text-slate-400 font-medium">{payload[0].payload.date}</p>
          <p className="text-xs text-emerald-400 font-bold">Consumed: <span className="font-mono">{payload[0].value} kcal</span></p>
          <p className="text-xs text-slate-400 font-semibold">Target: <span className="font-mono">{payload[1]?.value} kcal</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header and timeframe selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Hello, {user?.username}</span>
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </h1>
          <p className="text-slate-400 mt-1">Here is your daily health check and fitness progression.</p>
        </div>
        
        <div className="bg-slate-900 border border-slate-850 p-1 rounded-xl flex gap-1 text-xs font-semibold">
          <button
            onClick={() => setTimeframe(7)}
            className={`px-4 py-1.5 rounded-lg transition-colors ${timeframe === 7 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/10' : 'text-slate-400 hover:text-white'}`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeframe(30)}
            className={`px-4 py-1.5 rounded-lg transition-colors ${timeframe === 30 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/10' : 'text-slate-400 hover:text-white'}`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Top row: Summary widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Calorie Intake widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-2xl"></div>
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-emerald-400" />
              Calories Today
            </h2>
            <span className="text-2xs text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full font-bold">
              {calPercent}% of target
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-3xl font-black text-white font-mono">{macro_summary.calories_consumed}</span>
              <span className="text-slate-500 text-sm font-medium"> / {macro_summary.calories_target} kcal</span>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" 
                style={{ width: `${calPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Workout widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 rounded-full blur-2xl"></div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-cyan-400" />
              Workouts ({timeframe}d)
            </h2>
            <span className="text-2xs text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded-full font-bold">
              Active Session
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white font-mono">{workout_summary.total_workouts}</span>
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">sessions</span>
              <span className="text-slate-600 px-2">|</span>
              <span className="text-xl font-bold text-slate-200 font-mono">{workout_summary.total_minutes}</span>
              <span className="text-slate-500 text-2xs font-semibold uppercase tracking-wider">mins</span>
            </div>

            <div className="flex gap-2">
              <Link to="/workouts" className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold">
                <Plus className="w-3.5 h-3.5" /> Log a session
              </Link>
            </div>
          </div>
        </div>

        {/* Weight Progression Widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-400" />
              Current Weight
            </h2>
            <span className="text-2xs text-purple-400 bg-purple-500/15 px-2 py-0.5 rounded-full font-bold">
              Log daily
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-3xl font-black text-white font-mono">{user?.profile?.weight || '0.0'}</span>
              <span className="text-slate-500 text-sm font-medium"> kg</span>
            </div>

            <div className="flex gap-2">
              <Link to="/profile" className="text-xs text-purple-400 hover:text-purple-300 font-semibold">
                Update body weight &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Middle row: Macros splits and caloric balance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Macronutrients card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">Daily Macronutrient Targets</h3>
          
          <div className="space-y-5">
            {/* Protein */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Protein</span>
                <span className="text-slate-200 font-mono">{macro_summary.protein_consumed}g / {macro_summary.protein_target}g</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-50 rounded-full" style={{ width: `${proteinPercent}%` }}></div>
              </div>
            </div>

            {/* Carbs */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Carbs</span>
                <span className="text-slate-200 font-mono">{macro_summary.carbs_consumed}g / {macro_summary.carbs_target}g</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-purple-50 rounded-full" style={{ width: `${carbsPercent}%` }}></div>
              </div>
            </div>

            {/* Fat */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Fat</span>
                <span className="text-slate-200 font-mono">{macro_summary.fat_consumed}g / {macro_summary.fat_target}g</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-amber-50 rounded-full" style={{ width: `${fatPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Calorie Trend Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
          <h3 className="font-bold text-white text-base mb-4">Caloric Balance Trend</h3>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily_stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomCalorieTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="calories_consumed" name="Consumed" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="calories_target" name="Target" fill="#64748b" radius={[4, 4, 0, 0]} maxBarSize={30} opacity={0.3} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Weight Progression Chart & Workout Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Weight history Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
          <h3 className="font-bold text-white text-base mb-4">Weight Trend</h3>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily_stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip content={<CustomWeightTooltip />} />
                <Area type="monotone" dataKey="weight" name="Weight (kg)" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorWeight)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workout split breakdown / activity summaries */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
          <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">Workout splits</h3>

          <div className="space-y-4">
            {Object.keys(workout_summary.by_category).length === 0 ? (
              <p className="text-xs text-slate-500 italic py-6 text-center">No workout data for splits breakdown.</p>
            ) : (
              Object.entries(workout_summary.by_category).map(([cat, count]) => {
                const total = Object.values(workout_summary.by_category).reduce((a, b) => a + b, 0);
                const percent = Math.round((count / total) * 100);
                
                return (
                  <div key={cat} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-500 capitalize">{cat.toLowerCase()}</span>
                      <span className="text-slate-200">{count} ({percent}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          cat === 'STRENGTH' ? 'bg-cyan-500' :
                          cat === 'CARDIO' ? 'bg-emerald-500' :
                          cat === 'FLEXIBILITY' ? 'bg-purple-500' : 'bg-slate-500'
                        }`} 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
