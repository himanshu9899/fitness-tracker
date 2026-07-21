from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import datetime, timedelta, date as datetime_date
from django.db.models import Sum
from apps.users.models import WeightLog
from apps.workouts.models import Workout
from apps.diet.models import Meal


class DashboardAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = user.profile
        
        # Get requested timeframe (default to 7 days)
        try:
            days = int(request.query_params.get('days', 7))
        except ValueError:
            days = 7

        today = datetime_date.today()
        start_date = today - timedelta(days=days - 1)

        # 1. Fetch Meals, Workouts, and Weight Logs in the date range
        meals = Meal.objects.filter(user=user, date__range=[start_date, today]).prefetch_related('foods__food_item')
        workouts = Workout.objects.filter(user=user, date__range=[start_date, today]).prefetch_related('exercises__exercise')
        weight_logs = WeightLog.objects.filter(user=user, date__range=[start_date - timedelta(days=30), today]) # Look back slightly further for weights

        # Store weight log mapping by date
        weight_by_date = {wl.date: wl.weight for wl in weight_logs}
        
        # Helper to get weight for a date (or fall back to the most recent logged weight)
        def get_weight_for_date(target_date):
            if target_date in weight_by_date:
                return weight_by_date[target_date]
            # Find closest previous weight log
            prev_logs = [wl for wl in weight_logs if wl.date <= target_date]
            if prev_logs:
                return max(prev_logs, key=lambda wl: wl.date).weight
            return profile.weight # fallback to current profile weight

        # Build maps of daily meal & workout stats
        meals_by_date = {}
        for meal in meals:
            m_date = meal.date
            if m_date not in meals_by_date:
                meals_by_date[m_date] = {'calories': 0, 'protein': 0.0, 'carbs': 0.0, 'fat': 0.0}
            
            for m_food in meal.foods.all():
                meals_by_date[m_date]['calories'] += m_food.total_calories
                meals_by_date[m_date]['protein'] += m_food.total_protein
                meals_by_date[m_date]['carbs'] += m_food.total_carbs
                meals_by_date[m_date]['fat'] += m_food.total_fat

        workouts_by_date = {}
        for workout in workouts:
            w_date = workout.date
            if w_date not in workouts_by_date:
                workouts_by_date[w_date] = {'minutes': 0, 'count': 0, 'categories': []}
            workouts_by_date[w_date]['minutes'] += workout.duration
            workouts_by_date[w_date]['count'] += 1
            for we in workout.exercises.all():
                workouts_by_date[w_date]['categories'].append(we.exercise.category)

        # 2. Build daily stats array
        daily_stats = []
        for i in range(days):
            current_date = start_date + timedelta(days=i)
            
            day_meals = meals_by_date.get(current_date, {'calories': 0, 'protein': 0.0, 'carbs': 0.0, 'fat': 0.0})
            day_workouts = workouts_by_date.get(current_date, {'minutes': 0, 'count': 0, 'categories': []})
            
            daily_stats.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'calories_consumed': day_meals['calories'],
                'calories_target': profile.target_calories,
                'workout_minutes': day_workouts['minutes'],
                'weight': get_weight_for_date(current_date)
            })

        # 3. Macro stats for TODAY (or average for the period)
        today_meals = meals_by_date.get(today, {'calories': 0, 'protein': 0.0, 'carbs': 0.0, 'fat': 0.0})
        macro_summary = {
            'calories_consumed': today_meals['calories'],
            'calories_target': profile.target_calories,
            'protein_consumed': round(today_meals['protein'], 1),
            'protein_target': profile.target_protein,
            'carbs_consumed': round(today_meals['carbs'], 1),
            'carbs_target': profile.target_carbs,
            'fat_consumed': round(today_meals['fat'], 1),
            'fat_target': profile.target_fat,
        }

        # 4. Overall workout summary for the period
        total_workouts = 0
        total_minutes = 0
        category_counts = {}
        
        for w_data in workouts_by_date.values():
            total_workouts += w_data['count']
            total_minutes += w_data['minutes']
            for cat in w_data['categories']:
                category_counts[cat] = category_counts.get(cat, 0) + 1

        workout_summary = {
            'total_workouts': total_workouts,
            'total_minutes': total_minutes,
            'by_category': category_counts
        }

        return Response({
            'daily_stats': daily_stats,
            'macro_summary': macro_summary,
            'workout_summary': workout_summary
        })
