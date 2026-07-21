import os
import sys
import django
from datetime import date, timedelta
import random

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.users.models import Profile, WeightLog
from apps.workouts.models import Exercise, Workout, WorkoutExercise, ExerciseSet
from apps.diet.models import FoodItem, Meal, MealFoodItem

User = get_user_model()


def seed_data():
    print("Seeding database...")

    # 1. Create or update Demo User
    username = 'demo'
    email = 'demo@example.com'
    password = 'password123'
    
    user, created = User.objects.get_or_create(username=username, defaults={'email': email})
    if created:
        user.set_password(password)
        user.save()
        print(f"Created demo user '{username}' with password '{password}'")
    else:
        print(f"Demo user '{username}' already exists")

    # Update Profile
    profile = user.profile
    profile.age = 28
    profile.height = 178.0
    profile.weight = 80.2
    profile.gender = 'M'
    profile.activity_level = 'MODERATELY_ACTIVE'
    profile.target_calories = 2200
    profile.target_protein = 160
    profile.target_carbs = 230
    profile.target_fat = 70
    profile.save()
    print("Updated demo user profile details.")

    # 2. Create Global Exercises (created_by = None)
    exercises_data = [
        ('Bench Press', 'STRENGTH', 'Chest exercise using barbell.'),
        ('Squat', 'STRENGTH', 'Leg exercise targeting quads and glutes.'),
        ('Deadlift', 'STRENGTH', 'Full body compound exercise.'),
        ('Pull-Up', 'STRENGTH', 'Back exercise using bodyweight.'),
        ('Bicep Curl', 'STRENGTH', 'Isolation exercise for arms.'),
        ('Overhead Press', 'STRENGTH', 'Shoulder press exercise.'),
        ('Running', 'CARDIO', 'Outdoor jogging or treadmill run.'),
        ('Cycling', 'CARDIO', 'Stationary or outdoor bicycling.'),
        ('Yoga', 'FLEXIBILITY', 'Stretching and recovery session.'),
        ('Plank', 'OTHER', 'Core isometric hold exercise.'),
    ]

    exercise_map = {}
    for name, cat, desc in exercises_data:
        ex, created = Exercise.objects.update_or_create(
            name=name,
            created_by=None,
            defaults={'category': cat, 'description': desc}
        )
        exercise_map[name] = ex
    print(f"Seeded {len(exercise_map)} global exercises.")

    # 3. Create Global Food Items (created_by = None)
    foods_data = [
        ('Chicken Breast', 165, 31.0, 0.0, 3.6, '100g cooked'),
        ('White Rice', 130, 2.7, 28.0, 0.3, '100g cooked'),
        ('Whole Egg', 78, 6.3, 0.6, 5.3, '1 large egg'),
        ('Banana', 89, 1.1, 23.0, 0.3, '1 medium banana'),
        ('Oatmeal', 150, 6.0, 27.0, 2.5, '40g rolled oats (dry)'),
        ('Whey Protein', 120, 24.0, 3.0, 1.5, '1 scoop (30g)'),
        ('Peanut Butter', 94, 3.5, 3.0, 8.0, '1 tbsp (16g)'),
        ('Apple', 95, 0.5, 25.0, 0.3, '1 medium apple'),
        ('Salmon', 208, 20.0, 0.0, 13.0, '100g cooked'),
        ('Broccoli', 34, 2.8, 7.0, 0.4, '100g steamed'),
        ('Sweet Potato', 86, 1.6, 20.0, 0.1, '100g baked'),
        ('Almonds', 164, 6.0, 6.0, 14.0, '1 oz (28g)'),
    ]

    food_map = {}
    for name, cal, prot, carb, fat, size in foods_data:
        food, created = FoodItem.objects.update_or_create(
            name=name,
            created_by=None,
            defaults={
                'calories': cal,
                'protein': prot,
                'carbs': carb,
                'fat': fat,
                'serving_size': size
            }
        )
        food_map[name] = food
    print(f"Seeded {len(food_map)} global food items.")

    # Clear old user-specific data to make seeding idempotent and clean
    WeightLog.objects.filter(user=user).delete()
    Workout.objects.filter(user=user).delete()
    Meal.objects.filter(user=user).delete()

    # 4. Create weight log for last 7 days
    today = date.today()
    weights = [80.6, 80.4, 80.3, 80.5, 80.1, 79.9, 79.8]
    for idx, w in enumerate(weights):
        log_date = today - timedelta(days=(6 - idx))
        WeightLog.objects.create(user=user, date=log_date, weight=w)
    print("Seeded weight logs.")

    # 5. Create meals for the last 7 days
    # We will log oatmeal, whey protein, banana, chicken breast, rice, broccoli, egg, peanut butter
    for d_offset in range(7):
        log_date = today - timedelta(days=d_offset)
        
        # Breakfast
        m_bf = Meal.objects.create(user=user, date=log_date, meal_type='BREAKFAST', notes="Healthy breakfast")
        MealFoodItem.objects.create(meal=m_bf, food_item=food_map['Oatmeal'], servings=1.5)
        MealFoodItem.objects.create(meal=m_bf, food_item=food_map['Whey Protein'], servings=1.0)
        MealFoodItem.objects.create(meal=m_bf, food_item=food_map['Banana'], servings=1.0)

        # Lunch
        m_lh = Meal.objects.create(user=user, date=log_date, meal_type='LUNCH', notes="Post workout meal")
        MealFoodItem.objects.create(meal=m_lh, food_item=food_map['Chicken Breast'], servings=2.0)
        MealFoodItem.objects.create(meal=m_lh, food_item=food_map['White Rice'], servings=2.0)
        MealFoodItem.objects.create(meal=m_lh, food_item=food_map['Broccoli'], servings=1.5)

        # Dinner
        m_dn = Meal.objects.create(user=user, date=log_date, meal_type='DINNER', notes="Rest of day protein")
        MealFoodItem.objects.create(meal=m_dn, food_item=food_map['Salmon'], servings=1.5)
        MealFoodItem.objects.create(meal=m_dn, food_item=food_map['Sweet Potato'], servings=1.5)
        MealFoodItem.objects.create(meal=m_dn, food_item=food_map['Broccoli'], servings=1.0)

        # Snack (sometimes)
        if d_offset % 2 == 0:
            m_sn = Meal.objects.create(user=user, date=log_date, meal_type='SNACK', notes="Afternoon snack")
            MealFoodItem.objects.create(meal=m_sn, food_item=food_map['Apple'], servings=1.0)
            MealFoodItem.objects.create(meal=m_sn, food_item=food_map['Peanut Butter'], servings=1.5)

    print("Seeded 7 days of meals.")

    # 6. Create workouts for the last 7 days
    # Day 0: Push Day (Strength)
    w1 = Workout.objects.create(user=user, name="Push Day", date=today - timedelta(days=5), duration=60, notes="Chest and shoulders focus")
    we1 = WorkoutExercise.objects.create(workout=w1, exercise=exercise_map['Bench Press'], notes="Feeling strong today")
    ExerciseSet.objects.create(workout_exercise=we1, set_number=1, reps=10, weight=60.0, completed=True)
    ExerciseSet.objects.create(workout_exercise=we1, set_number=2, reps=8, weight=70.0, completed=True)
    ExerciseSet.objects.create(workout_exercise=we1, set_number=3, reps=6, weight=80.0, completed=True)
    
    we2 = WorkoutExercise.objects.create(workout=w1, exercise=exercise_map['Overhead Press'], notes="Shoulder focus")
    ExerciseSet.objects.create(workout_exercise=we2, set_number=1, reps=10, weight=30.0, completed=True)
    ExerciseSet.objects.create(workout_exercise=we2, set_number=2, reps=10, weight=35.0, completed=True)
    ExerciseSet.objects.create(workout_exercise=we2, set_number=3, reps=8, weight=40.0, completed=True)

    # Day 2: Cardio Run
    w2 = Workout.objects.create(user=user, name="Morning Run", date=today - timedelta(days=3), duration=45, notes="Endurance session")
    we3 = WorkoutExercise.objects.create(workout=w2, exercise=exercise_map['Running'], notes="Laps around park")
    ExerciseSet.objects.create(workout_exercise=we3, set_number=1, duration=2700, distance=8.2, completed=True)

    # Day 4: Leg Day
    w3 = Workout.objects.create(user=user, name="Leg Day", date=today - timedelta(days=2), duration=75, notes="Squat heavy day")
    we4 = WorkoutExercise.objects.create(workout=w3, exercise=exercise_map['Squat'], notes="Glutes and quads")
    ExerciseSet.objects.create(workout_exercise=we4, set_number=1, reps=12, weight=60.0, completed=True)
    ExerciseSet.objects.create(workout_exercise=we4, set_number=2, reps=10, weight=80.0, completed=True)
    ExerciseSet.objects.create(workout_exercise=we4, set_number=3, reps=8, weight=90.0, completed=True)
    ExerciseSet.objects.create(workout_exercise=we4, set_number=4, reps=6, weight=100.0, completed=True)

    # Day 5: Pull Day & Core
    w4 = Workout.objects.create(user=user, name="Pull & Core Day", date=today - timedelta(days=1), duration=50, notes="Back and abs")
    we5 = WorkoutExercise.objects.create(workout=w4, exercise=exercise_map['Pull-Up'], notes="Bodyweight pullups")
    ExerciseSet.objects.create(workout_exercise=we5, set_number=1, reps=10, completed=True)
    ExerciseSet.objects.create(workout_exercise=we5, set_number=2, reps=8, completed=True)
    ExerciseSet.objects.create(workout_exercise=we5, set_number=3, reps=8, completed=True)

    we6 = WorkoutExercise.objects.create(workout=w4, exercise=exercise_map['Bicep Curl'], notes="Arm pump")
    ExerciseSet.objects.create(workout_exercise=we6, set_number=1, reps=12, weight=12.5, completed=True)
    ExerciseSet.objects.create(workout_exercise=we6, set_number=2, reps=10, weight=15.0, completed=True)

    we7 = WorkoutExercise.objects.create(workout=w4, exercise=exercise_map['Plank'], notes="Core burn")
    ExerciseSet.objects.create(workout_exercise=we7, set_number=1, duration=60, completed=True)
    ExerciseSet.objects.create(workout_exercise=we7, set_number=2, duration=45, completed=True)

    print("Seeded workouts.")
    print("Database seeding completed successfully!")


if __name__ == '__main__':
    seed_data()
