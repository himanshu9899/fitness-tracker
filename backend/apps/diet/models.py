from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class FoodItem(models.Model):
    name = models.CharField(max_length=100)
    calories = models.IntegerField(help_text="Calories per serving")
    protein = models.FloatField(help_text="Protein in grams per serving", default=0.0)
    carbs = models.FloatField(help_text="Carbohydrates in grams per serving", default=0.0)
    fat = models.FloatField(help_text="Fat in grams per serving", default=0.0)
    serving_size = models.CharField(max_length=50, default="100g", help_text="e.g. 100g, 1 serving, 1 piece")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='custom_foods')

    class Meta:
        ordering = ['name']
        constraints = [
            models.UniqueConstraint(fields=['name', 'created_by'], name='unique_food_name_per_user')
        ]

    def __str__(self):
        return f"{self.name} ({self.serving_size})"


class Meal(models.Model):
    MEAL_TYPE_CHOICES = [
        ('BREAKFAST', 'Breakfast'),
        ('LUNCH', 'Lunch'),
        ('DINNER', 'Dinner'),
        ('SNACK', 'Snack'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meals')
    date = models.DateField()
    meal_type = models.CharField(max_length=15, choices=MEAL_TYPE_CHOICES)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-date', 'meal_type']

    def __str__(self):
        return f"{self.user.username} - {self.meal_type} ({self.date})"


class MealFoodItem(models.Model):
    meal = models.ForeignKey(Meal, on_delete=models.CASCADE, related_name='foods')
    food_item = models.ForeignKey(FoodItem, on_delete=models.CASCADE)
    servings = models.FloatField(default=1.0, help_text="Multiplier of serving size")

    def __str__(self):
        return f"{self.servings}x {self.food_item.name} in {self.meal.meal_type}"

    @property
    def total_calories(self):
        return round(self.food_item.calories * self.servings)

    @property
    def total_protein(self):
        return round(self.food_item.protein * self.servings, 1)

    @property
    def total_carbs(self):
        return round(self.food_item.carbs * self.servings, 1)

    @property
    def total_fat(self):
        return round(self.food_item.fat * self.servings, 1)
