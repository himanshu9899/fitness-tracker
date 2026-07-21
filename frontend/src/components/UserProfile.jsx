import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Target, Settings, Scale, Check, AlertCircle } from 'lucide-react';

const UserProfile = () => {
  const { user, updateProfile, logWeight } = useAuth();
  
  // Profile settings state
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('M');
  const [activityLevel, setActivityLevel] = useState('SEDENTARY');
  
  // Goals state
  const [targetCalories, setTargetCalories] = useState('');
  const [targetProtein, setTargetProtein] = useState('');
  const [targetCarbs, setTargetCarbs] = useState('');
  const [targetFat, setTargetFat] = useState('');

  // Daily weight log state
  const [logWeightVal, setLogWeightVal] = useState('');
  const [logWeightDate, setLogWeightDate] = useState(new Date().toISOString().split('T')[0]);

  // Feedbacks
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [weightSuccess, setWeightSuccess] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      const p = user.profile;
      setAge(p.age || '');
      setHeight(p.height || '');
      setWeight(p.weight || '');
      setGender(p.gender || 'M');
      setActivityLevel(p.activity_level || 'SEDENTARY');
      setTargetCalories(p.target_calories || '');
      setTargetProtein(p.target_protein || '');
      setTargetCarbs(p.target_carbs || '');
      setTargetFat(p.target_fat || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess(false);
    const success = await updateProfile({
      age: age ? parseInt(age) : null,
      height: height ? parseFloat(height) : null,
      weight: weight ? parseFloat(weight) : null,
      gender,
      activity_level: activityLevel,
      target_calories: targetCalories ? parseInt(targetCalories) : 2000,
      target_protein: targetProtein ? parseInt(targetProtein) : 150,
      target_carbs: targetCarbs ? parseInt(targetCarbs) : 200,
      target_fat: targetFat ? parseInt(targetFat) : 70,
    });
    if (success) {
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    }
  };

  const handleWeightSubmit = async (e) => {
    e.preventDefault();
    setWeightSuccess(false);
    if (!logWeightVal) return;
    const success = await logWeight(logWeightVal, logWeightDate);
    if (success) {
      setWeight(logWeightVal); // update profile displayed weight
      setLogWeightVal('');
      setWeightSuccess(true);
      setTimeout(() => setWeightSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Profile & Goals</h1>
        <p className="text-slate-400 mt-1">Manage your body stats, nutritional goals, and log daily weight metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Body stats and goals */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleProfileSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <Settings className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Edit Body Metrics & Goals</h2>
            </div>

            {profileSuccess && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 rounded-xl flex items-center gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-500" />
                <span>Profile configuration saved successfully.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Age */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 28"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-cyan-500 transition-all text-sm"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-cyan-500 transition-all text-sm"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>

              {/* Height */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-2">Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g. 175"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-cyan-500 transition-all text-sm"
                />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-455 mb-2">Current Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 78.5"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-cyan-500 transition-all text-sm"
                />
              </div>

              {/* Activity Level */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-2">Activity Level</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-cyan-500 transition-all text-sm"
                >
                  <option value="SEDENTARY">Sedentary (little/no exercise)</option>
                  <option value="LIGHTLY_ACTIVE">Lightly Active (light exercise 1-3 days/wk)</option>
                  <option value="MODERATELY_ACTIVE">Moderately Active (moderate exercise 3-5 days/wk)</option>
                  <option value="VERY_ACTIVE">Very Active (hard exercise 6-7 days/wk)</option>
                  <option value="EXTRA_ACTIVE">Extra Active (heavy manual job/double sessions)</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Daily Nutritional Targets
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Target Calories */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-2">Calories (kcal)</label>
                  <input
                    type="number"
                    value={targetCalories}
                    onChange={(e) => setTargetCalories(e.target.value)}
                    placeholder="e.g. 2000"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-cyan-500 transition-all text-sm"
                  />
                </div>

                {/* Target Protein */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-2">Protein (g)</label>
                  <input
                    type="number"
                    value={targetProtein}
                    onChange={(e) => setTargetProtein(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-cyan-500 transition-all text-sm"
                  />
                </div>

                {/* Target Carbs */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-455 mb-2">Carbs (g)</label>
                  <input
                    type="number"
                    value={targetCarbs}
                    onChange={(e) => setTargetCarbs(e.target.value)}
                    placeholder="e.g. 200"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-cyan-500 transition-all text-sm"
                  />
                </div>

                {/* Target Fat */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-455 mb-2">Fat (g)</label>
                  <input
                    type="number"
                    value={targetFat}
                    onChange={(e) => setTargetFat(e.target.value)}
                    placeholder="e.g. 70"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-cyan-500 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg transition-all text-sm"
            >
              Save Changes
            </button>
          </form>
        </div>

        {/* Right Side: Log Daily Weight */}
        <div className="space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-lg">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <Scale className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Log Weight History</h2>
            </div>

            {weightSuccess && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 rounded-xl flex items-center gap-3 text-sm">
                <Check className="w-5 h-5 text-emerald-500" />
                <span>Weight log recorded.</span>
              </div>
            )}

            <form onSubmit={handleWeightSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-450 mb-2">Log Date</label>
                <input
                  type="date"
                  required
                  value={logWeightDate}
                  onChange={(e) => setLogWeightDate(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-cyan-500 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-455 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={logWeightVal}
                  onChange={(e) => setLogWeightVal(e.target.value)}
                  placeholder="e.g. 79.5"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-cyan-500 transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl border border-slate-700 transition-all text-sm"
              >
                Log Weight Entry
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-400 text-sm space-y-3">
            <h3 className="font-semibold text-white">About Calculations:</h3>
            <p>Your BMR and calorie target depend heavily on age, height, and activity level.</p>
            <p>Regularly logging your weight here will populate the visual analytics graph on the dashboard, making it easy to track trends.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
