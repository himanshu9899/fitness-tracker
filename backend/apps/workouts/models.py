from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Exercise(models.Model):
    CATEGORY_CHOICES = [
        ('STRENGTH', 'Strength'),
        ('CARDIO', 'Cardio'),
        ('FLEXIBILITY', 'Flexibility'),
        ('OTHER', 'Other'),
    ]

    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='STRENGTH')
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='custom_exercises')

    class Meta:
        ordering = ['name']
        constraints = [
            models.UniqueConstraint(fields=['name', 'created_by'], name='unique_exercise_name_per_user')
        ]

    def __str__(self):
        return self.name


class Workout(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workouts')
    name = models.CharField(max_length=100, default='Workout')
    date = models.DateField()
    duration = models.IntegerField(help_text="Duration in minutes", default=0)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-date', '-id']

    def __str__(self):
        return f"{self.user.username} - {self.name} ({self.date})"


class WorkoutExercise(models.Model):
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name='exercises')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    notes = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.exercise.name} in {self.workout.name}"


class ExerciseSet(models.Model):
    workout_exercise = models.ForeignKey(WorkoutExercise, on_delete=models.CASCADE, related_name='sets')
    set_number = models.IntegerField(default=1)
    reps = models.IntegerField(blank=True, null=True, help_text="Number of repetitions")
    weight = models.FloatField(blank=True, null=True, help_text="Weight in kg/lbs")
    duration = models.IntegerField(blank=True, null=True, help_text="Duration in seconds (e.g. for plank/cardio)")
    distance = models.FloatField(blank=True, null=True, help_text="Distance in km (e.g. for running/cycling)")
    completed = models.BooleanField(default=False)

    class Meta:
        ordering = ['set_number']

    def __str__(self):
        return f"Set {self.set_number} - {self.workout_exercise.exercise.name}"
