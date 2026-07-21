import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Apple, Plus, Trash2, Calendar, Coffee, Utensils, Moon, HelpCircle } from 'lucide-react';

const DietTracker = () => {
  const { user } = useAuth();
  const [meals, setMeals] = useState([]);
  const [foods, setFoods] = useState([]);
  
  // Log meal states
  const [isLogging, setIsLogging] = useState(false);
  const [mealDate, setMealDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealType, setMealType] = useState('BREAKFAST');
  const [mealNotes, setMealNotes] = useState('');
  
  // Custom meal foods builder
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [customFoodName, setCustomFoodName] = useState('');
  const [customFoodCalories, setCustomFoodCalories] = useState('');
  const [customFoodProtein, setCustomFoodProtein] = useState('');
  const [customFoodCarbs, setCustomFoodCarbs] = useState('');
  const [customFoodFat, setCustomFoodFat] = useState('');
  const [customFoodServingSize, setCustomFoodServingSize] = useState('100g');

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mealsRes, foodsRes] = await Promise.all([
        api.get('diet/'),
        api.get('diet/foods/')
      ]);
      setMeals(mealsRes.data);
      setFoods(foodsRes.data);
    } catch (err) {
      console.error('Failed to load diet data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFoodToMeal = (foodId) => {
    const food = foods.find(f => f.id === parseInt(foodId));
    if (!food) return;
    
    // Check if food already in current list
    if (selectedFoods.some(sf => sf.food_item === food.id)) return;

    setSelectedFoods([
      ...selectedFoods,
      {
        food_item: food.id,
        food_name: food.name,
        food_serving_size: food.serving_size,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        servings: 1.0
      }
    ]);
  };

  const handleRemoveFoodFromMeal = (index) => {
    setSelectedFoods(selectedFoods.filter((_, i) => i !== index));
  };

  const handleServingsChange = (index, value) => {
    const updated = [...selectedFoods];
    updated[index].servings = parseFloat(value) || 0;
    setSelectedFoods(updated);
  };

  const handleCreateCustomFood = async (e) => {
    e.preventDefault();
    if (!customFoodName.trim() || !customFoodCalories) return;
    
    try {
      const res = await api.post('diet/foods/', {
        name: customFoodName,
        calories: parseInt(customFoodCalories),
        protein: parseFloat(customFoodProtein) || 0,
        carbs: parseFloat(customFoodCarbs) || 0,
        fat: parseFloat(customFoodFat) || 0,
        serving_size: customFoodServingSize
      });
      
      setFoods([...foods, res.data]);
      handleAddFoodToMeal(res.data.id);
      
      // Reset form
      setCustomFoodName('');
      setCustomFoodCalories('');
      setCustomFoodProtein('');
      setCustomFoodCarbs('');
      setCustomFoodFat('');
      setCustomFoodServingSize('100g');
    } catch (err) {
      console.error('Failed to create custom food', err);
    }
  };

  const handleSaveMeal = async (e) => {
    e.preventDefault();
    if (selectedFoods.length === 0) {
      alert('Please add at least one food item to your meal!');
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        date: mealDate,
        meal_type: mealType,
        notes: mealNotes,
        foods: selectedFoods.map(sf => ({
          food_item: sf.food_item,
          servings: sf.servings
        }))
      };

      await api.post('diet/', payload);
      setIsLogging(false);
      setSelectedFoods([]);
      setMealNotes('');
      fetchData();
    } catch (err) {
      console.error('Failed to save meal', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteMeal = async (id) => {
    if (!confirm('Are you sure you want to delete this meal log?')) return;
    try {
      await api.delete(`diet/${id}/`);
      setMeals(meals.filter(m => m.id !== id));
    } catch (err) {
      console.error('Failed to delete meal', err);
    }
  };

  // Group meals by date for history viewing
  const groupedMeals = meals.reduce((acc, meal) => {
    const d = meal.date;
    if (!acc[d]) acc[d] = { date: d, items: [], totalCals: 0 };
    acc[d].items.push(meal);
    acc[d].totalCals += meal.total_calories;
    return acc;
  }, {});

  const getMealIcon = (type) => {
    switch (type) {
      case 'BREAKFAST': return <Coffee className="w-4 h-4 text-amber-400" />;
      case 'LUNCH': return <Utensils className="w-4 h-4 text-emerald-400" />;
      case 'DINNER': return <Moon className="w-4 h-4 text-indigo-400" />;
      default: return <Apple className="w-4 h-4 text-pink-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Diet & Calorie Counter</h1>
          <p className="text-slate-400 mt-1">Track foods, count daily calories, and monitor macronutrient distribution.</p>
        </div>
        {!isLogging && (
          <button
            onClick={() => setIsLogging(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-450 hover:to-teal-555 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Log Meal
          </button>
        )}
      </div>

      {isLogging ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Meal Editor */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-bold text-white">Log Meal Entry</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Meal Type</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 text-sm"
                >
                  <option value="BREAKFAST">Breakfast</option>
                  <option value="LUNCH">Lunch</option>
                  <option value="DINNER">Dinner</option>
                  <option value="SNACK">Snack</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date</label>
                <input
                  type="date"
                  value={mealDate}
                  onChange={(e) => setMealDate(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Meal Notes</label>
                <input
                  type="text"
                  value={mealNotes}
                  onChange={(e) => setMealNotes(e.target.value)}
                  placeholder="e.g. Pre-workout shake"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>
            </div>

            {/* Selected Foods Items List */}
            <div className="space-y-4">
              <h3 className="text-md font-bold text-white border-b border-slate-800 pb-2">Foods in Meal</h3>

              {selectedFoods.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">Select food items from the sidebar to compile your meal.</p>
              ) : (
                <div className="space-y-3">
                  {selectedFoods.map((sf, idx) => (
                    <div key={idx} className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-white text-sm">{sf.food_name}</h4>
                        <p className="text-xs text-slate-500">
                          Serving size: {sf.food_serving_size} | {Math.round(sf.calories * sf.servings)} kcal | P:{Math.round(sf.protein * sf.servings)}g C:{Math.round(sf.carbs * sf.servings)}g F:{Math.round(sf.fat * sf.servings)}g
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-400">Servings:</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={sf.servings}
                            onChange={(e) => handleServingsChange(idx, e.target.value)}
                            className="w-16 bg-slate-950 border border-slate-800 rounded py-1 px-2 text-center text-white focus:outline-none focus:border-cyan-500 text-xs font-mono"
                          />
                        </div>
                        <button
                          onClick={() => handleRemoveFoodFromMeal(idx)}
                          className="text-red-400 hover:text-red-300 p-1 hover:bg-slate-850 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 border-t border-slate-800 pt-6">
              <button
                onClick={handleSaveMeal}
                disabled={submitLoading}
                className="bg-gradient-to-r from-emerald-500 to-teal-650 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg transition-all text-sm disabled:opacity-50"
              >
                {submitLoading ? 'Saving...' : 'Save Meal'}
              </button>
              <button
                onClick={() => {
                  setIsLogging(false);
                  setSelectedFoods([]);
                }}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all text-sm"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Foods Selector / Custom Food Builder Sidebar */}
          <div className="space-y-6">
            {/* Search and Select Foods */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-white text-base">Select Food Item</h3>
              <div className="max-h-60 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 pr-1">
                {foods.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleAddFoodToMeal(f.id)}
                    className="w-full flex justify-between items-center text-left py-2 px-3 rounded-lg hover:bg-slate-850 text-sm text-slate-300 transition-colors"
                  >
                    <span>{f.name}</span>
                    <span className="text-xs text-slate-500 font-mono">{f.calories} kcal</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Create Custom Food */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-white text-base">Create Custom Food</h3>
              <form onSubmit={handleCreateCustomFood} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Food Name</label>
                  <input
                    type="text"
                    required
                    value={customFoodName}
                    onChange={(e) => setCustomFoodName(e.target.value)}
                    placeholder="e.g. Greek Yogurt"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Calories</label>
                    <input
                      type="number"
                      required
                      value={customFoodCalories}
                      onChange={(e) => setCustomFoodCalories(e.target.value)}
                      placeholder="kcal"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Serving Size</label>
                    <input
                      type="text"
                      required
                      value={customFoodServingSize}
                      onChange={(e) => setCustomFoodServingSize(e.target.value)}
                      placeholder="e.g. 150g cup"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-2xs font-semibold text-slate-500 uppercase text-center mb-1">Protein (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customFoodProtein}
                      onChange={(e) => setCustomFoodProtein(e.target.value)}
                      placeholder="P"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-2 text-center text-white focus:outline-none focus:border-cyan-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-semibold text-slate-500 uppercase text-center mb-1">Carbs (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customFoodCarbs}
                      onChange={(e) => setCustomFoodCarbs(e.target.value)}
                      placeholder="C"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-2 text-center text-white focus:outline-none focus:border-cyan-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-semibold text-slate-500 uppercase text-center mb-1">Fat (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customFoodFat}
                      onChange={(e) => setCustomFoodFat(e.target.value)}
                      placeholder="F"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-2 text-center text-white focus:outline-none focus:border-cyan-500 text-xs"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-850 hover:bg-slate-800 text-emerald-450 border border-slate-850 py-2.5 rounded-xl font-semibold transition-all text-xs"
                >
                  Create & Add
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Meals History list */
        <div className="space-y-8">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading food log history...</div>
          ) : Object.keys(groupedMeals).length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-4">
              <Apple className="w-12 h-12 text-slate-700 mx-auto" />
              <div>
                <h3 className="font-bold text-white text-lg">No Meals Logged</h3>
                <p className="text-slate-400 text-sm mt-1">Start counting calories by logging your first meal.</p>
              </div>
            </div>
          ) : (
            Object.values(groupedMeals).map((group) => (
              <div key={group.date} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-base md:text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                    {group.date}
                  </h3>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-slate-400">Daily Total: </span>
                    <span className="text-sm font-bold text-emerald-450 font-mono">{group.totalCals} kcal</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.items.map((meal) => (
                    <div key={meal.id} className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {getMealIcon(meal.meal_type)}
                          <span className="font-bold text-sm text-slate-200 uppercase tracking-wider">{meal.meal_type}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-xs text-emerald-450 font-mono">{meal.total_calories} kcal</span>
                          <button
                            onClick={() => handleDeleteMeal(meal.id)}
                            className="text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {meal.notes && (
                        <p className="text-2xs bg-slate-900 border border-slate-800/30 p-1.5 rounded-lg text-slate-400 italic">
                          "{meal.notes}"
                        </p>
                      )}

                      <div className="space-y-1.5 text-xs text-slate-400">
                        {meal.foods.map((food, fIdx) => (
                          <div key={fIdx} className="flex justify-between">
                            <span>{food.servings}x {food.food_name}</span>
                            <span className="font-mono text-slate-500">{food.total_calories} kcal</span>
                          </div>
                        ))}
                      </div>

                      {/* Macronutrients breakdown info */}
                      <div className="border-t border-slate-850 pt-2 flex justify-between text-2xs text-slate-500 font-mono uppercase tracking-wider">
                        <span>P: <strong className="text-slate-350">{meal.total_protein}g</strong></span>
                        <span>C: <strong className="text-slate-350">{meal.total_carbs}g</strong></span>
                        <span>F: <strong className="text-slate-350">{meal.total_fat}g</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DietTracker;
