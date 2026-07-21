import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Dumbbell, Plus, Trash2, Calendar, Clock, Clipboard, Check, PlusCircle } from 'lucide-react';

const WorkoutLogger = () => {
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  
  // Log workout mode
  const [isLogging, setIsLogging] = useState(false);
  const [workoutName, setWorkoutName] = useState('My Workout');
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [workoutDuration, setWorkoutDuration] = useState('60');
  const [workoutNotes, setWorkoutNotes] = useState('');
  
  // Custom workout exercises builder
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [customExerciseCategory, setCustomExerciseCategory] = useState('STRENGTH');

  // Loading & error
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [workoutsRes, exercisesRes] = await Promise.all([
        api.get('workouts/'),
        api.get('workouts/exercises/')
      ]);
      setWorkouts(workoutsRes.data);
      setExercises(exercisesRes.data);
    } catch (err) {
      console.error('Failed to load workout data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExerciseToWorkout = (exerciseId) => {
    const exercise = exercises.find(e => e.id === parseInt(exerciseId));
    if (!exercise) return;
    
    setSelectedExercises([
      ...selectedExercises,
      {
        exercise: exercise.id,
        exercise_name: exercise.name,
        exercise_category: exercise.category,
        notes: '',
        sets: [{ set_number: 1, reps: 10, weight: 0, duration: 0, distance: 0, completed: true }]
      }
    ]);
  };

  const handleRemoveExerciseFromWorkout = (index) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const handleAddSet = (exerciseIndex) => {
    const updated = [...selectedExercises];
    const sets = updated[exerciseIndex].sets;
    const lastSet = sets[sets.length - 1];
    
    sets.push({
      set_number: sets.length + 1,
      reps: lastSet ? lastSet.reps : 10,
      weight: lastSet ? lastSet.weight : 0,
      duration: lastSet ? lastSet.duration : 0,
      distance: lastSet ? lastSet.distance : 0,
      completed: true
    });
    setSelectedExercises(updated);
  };

  const handleRemoveSet = (exerciseIndex, setIndex) => {
    const updated = [...selectedExercises];
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, i) => i !== setIndex);
    // Fix set numbering
    updated[exerciseIndex].sets.forEach((set, i) => {
      set.set_number = i + 1;
    });
    setSelectedExercises(updated);
  };

  const handleSetChange = (exerciseIndex, setIndex, field, value) => {
    const updated = [...selectedExercises];
    updated[exerciseIndex].sets[setIndex][field] = value;
    setSelectedExercises(updated);
  };

  const handleCreateCustomExercise = async (e) => {
    e.preventDefault();
    if (!customExerciseName.trim()) return;
    try {
      const res = await api.post('workouts/exercises/', {
        name: customExerciseName,
        category: customExerciseCategory
      });
      setExercises([...exercises, res.data]);
      handleAddExerciseToWorkout(res.data.id);
      setCustomExerciseName('');
    } catch (err) {
      console.error('Failed to create custom exercise', err);
    }
  };

  const handleSaveWorkout = async (e) => {
    e.preventDefault();
    if (selectedExercises.length === 0) {
      alert('Please add at least one exercise to your workout!');
      return;
    }
    
    setSubmitLoading(true);
    try {
      const payload = {
        name: workoutName,
        date: workoutDate,
        duration: parseInt(workoutDuration) || 0,
        notes: workoutNotes,
        exercises: selectedExercises.map(se => ({
          exercise: se.exercise,
          notes: se.notes,
          sets: se.sets.map(s => ({
            set_number: s.set_number,
            reps: s.reps ? parseInt(s.reps) : null,
            weight: s.weight ? parseFloat(s.weight) : null,
            duration: s.duration ? parseInt(s.duration) : null,
            distance: s.distance ? parseFloat(s.distance) : null,
            completed: s.completed
          }))
        }))
      };

      await api.post('workouts/', payload);
      setIsLogging(false);
      setSelectedExercises([]);
      setWorkoutName('My Workout');
      setWorkoutNotes('');
      fetchData();
    } catch (err) {
      console.error('Failed to save workout', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteWorkout = async (id) => {
    if (!confirm('Are you sure you want to delete this workout log?')) return;
    try {
      await api.delete(`workouts/${id}/`);
      setWorkouts(workouts.filter(w => w.id !== id));
    } catch (err) {
      console.error('Failed to delete workout', err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Workouts</h1>
          <p className="text-slate-400 mt-1">Log exercises, view history, and keep track of progressive overload.</p>
        </div>
        {!isLogging && (
          <button
            onClick={() => setIsLogging(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Log New Workout
          </button>
        )}
      </div>

      {isLogging ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Log Editor */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-bold text-white">Log Workout Session</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Workout Name</label>
                <input
                  type="text"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date</label>
                <input
                  type="date"
                  value={workoutDate}
                  onChange={(e) => setWorkoutDate(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Duration (min)</label>
                <input
                  type="number"
                  value={workoutDuration}
                  onChange={(e) => setWorkoutDuration(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes</label>
              <input
                type="text"
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                placeholder="How did you feel today?"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-cyan-500 text-sm"
              />
            </div>

            {/* Selected Exercises Set Loggers */}
            <div className="space-y-6">
              <h3 className="text-md font-bold text-white border-b border-slate-800 pb-2">Logged Exercises</h3>
              
              {selectedExercises.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">Select or create an exercise from the sidebar to begin logging sets.</p>
              ) : (
                selectedExercises.map((se, exIdx) => (
                  <div key={exIdx} className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-white text-sm md:text-base">{se.exercise_name}</h4>
                        <span className="text-xs font-medium text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">{se.exercise_category}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveExerciseFromWorkout(exIdx)}
                        className="text-red-400 hover:text-red-300 p-1 hover:bg-slate-850 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Sets Headings */}
                    <div className="grid grid-cols-12 gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider text-center">
                      <div className="col-span-2">Set</div>
                      <div className="col-span-3">Reps</div>
                      <div className="col-span-3">Weight (kg)</div>
                      <div className="col-span-3">Cardio (min/km)</div>
                      <div className="col-span-1"></div>
                    </div>

                    {/* Sets Rows */}
                    <div className="space-y-2">
                      {se.sets.map((set, setIdx) => (
                        <div key={setIdx} className="grid grid-cols-12 gap-2 items-center text-center">
                          <div className="col-span-2 text-slate-300 font-mono text-sm">#{set.set_number}</div>
                          <div className="col-span-3">
                            <input
                              type="number"
                              disabled={se.exercise_category === 'CARDIO'}
                              value={set.reps}
                              onChange={(e) => handleSetChange(exIdx, setIdx, 'reps', e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded py-1 text-center text-white focus:outline-none focus:border-cyan-500 text-xs md:text-sm disabled:opacity-30"
                            />
                          </div>
                          <div className="col-span-3">
                            <input
                              type="number"
                              step="0.5"
                              disabled={se.exercise_category === 'CARDIO'}
                              value={set.weight}
                              onChange={(e) => handleSetChange(exIdx, setIdx, 'weight', e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded py-1 text-center text-white focus:outline-none focus:border-cyan-500 text-xs md:text-sm disabled:opacity-30"
                            />
                          </div>
                          <div className="col-span-3 flex gap-1">
                            <input
                              type="number"
                              placeholder="min"
                              disabled={se.exercise_category === 'STRENGTH'}
                              value={set.duration ? Math.round(set.duration / 60) : ''}
                              onChange={(e) => handleSetChange(exIdx, setIdx, 'duration', e.target.value ? parseInt(e.target.value) * 60 : 0)}
                              className="w-1/2 bg-slate-950 border border-slate-800 rounded py-1 text-center text-white focus:outline-none focus:border-cyan-500 text-xs disabled:opacity-30"
                            />
                            <input
                              type="number"
                              step="0.1"
                              placeholder="km"
                              disabled={se.exercise_category === 'STRENGTH'}
                              value={set.distance || ''}
                              onChange={(e) => handleSetChange(exIdx, setIdx, 'distance', e.target.value)}
                              className="w-1/2 bg-slate-950 border border-slate-800 rounded py-1 text-center text-white focus:outline-none focus:border-cyan-500 text-xs disabled:opacity-30"
                            />
                          </div>
                          <div className="col-span-1">
                            <button
                              onClick={() => handleRemoveSet(exIdx, setIdx)}
                              className="text-slate-500 hover:text-red-400 p-0.5"
                            >
                              &times;
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleAddSet(exIdx)}
                      className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Add Set
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-4 border-t border-slate-800 pt-6">
              <button
                onClick={handleSaveWorkout}
                disabled={submitLoading}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg transition-all text-sm disabled:opacity-50"
              >
                {submitLoading ? 'Saving...' : 'Save Workout'}
              </button>
              <button
                onClick={() => {
                  setIsLogging(false);
                  setSelectedExercises([]);
                }}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all text-sm"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Exercise Selector / Builder Sidebar */}
          <div className="space-y-6">
            {/* Search and Select */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-white text-base">Select Exercise</h3>
              <div className="max-h-60 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 pr-1">
                {exercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => handleAddExerciseToWorkout(ex.id)}
                    className="w-full flex justify-between items-center text-left py-2 px-3 rounded-lg hover:bg-slate-800 text-sm text-slate-300 transition-colors"
                  >
                    <span>{ex.name}</span>
                    <span className="text-xs text-slate-500 bg-slate-950 px-2 py-0.5 rounded">{ex.category}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Create Custom */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-white text-base">Create Custom Exercise</h3>
              <form onSubmit={handleCreateCustomExercise} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={customExerciseName}
                    onChange={(e) => setCustomExerciseName(e.target.value)}
                    placeholder="e.g. Incline Bench Press"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={customExerciseCategory}
                    onChange={(e) => setCustomExerciseCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 text-sm"
                  >
                    <option value="STRENGTH">Strength</option>
                    <option value="CARDIO">Cardio</option>
                    <option value="FLEXIBILITY">Flexibility</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-850 hover:bg-slate-800 text-cyan-400 border border-slate-850 py-2.5 rounded-xl font-semibold transition-all text-xs"
                >
                  Create & Add
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Workouts History Logs List */
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading workouts...</div>
          ) : workouts.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-4">
              <Dumbbell className="w-12 h-12 text-slate-700 mx-auto" />
              <div>
                <h3 className="font-bold text-white text-lg">No Workouts Recorded</h3>
                <p className="text-slate-400 text-sm mt-1">Get started by creating your first logged fitness session.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workouts.map((w) => (
                <div key={w.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-750 transition-all shadow-md">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-white">{w.name}</h3>
                        <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {w.date}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {w.duration} min</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteWorkout(w.id)}
                        className="text-slate-500 hover:text-red-400 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {w.notes && (
                      <p className="text-xs bg-slate-950/60 border border-slate-800/40 p-2.5 rounded-lg text-slate-400 italic">
                        "{w.notes}"
                      </p>
                    )}

                    <div className="space-y-2.5">
                      {w.exercises.map((we, idx) => (
                        <div key={idx} className="border-t border-slate-800/60 pt-2.5 text-sm">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="font-semibold text-slate-200">{we.exercise_name}</span>
                            <span className="text-2xs text-slate-505 bg-slate-950 px-1.5 py-0.5 rounded">{we.exercise_category}</span>
                          </div>
                          
                          {/* Sets details formatting */}
                          <div className="flex flex-wrap gap-1 text-slate-400 text-xs">
                            {we.sets.map((s, sIdx) => (
                              <span key={sIdx} className="bg-slate-950/80 px-2 py-0.5 border border-slate-800/40 rounded font-mono">
                                {we.exercise_category === 'CARDIO' ? (
                                  `${s.distance ? s.distance + 'km' : ''} ${s.duration ? Math.round(s.duration / 60) + 'min' : ''}`
                                ) : (
                                  `${s.reps}x${s.weight}kg`
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkoutLogger;
